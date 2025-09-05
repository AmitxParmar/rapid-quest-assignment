import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";
import { env } from "../config/env";
import { clearAuthCookies } from "../utils/cookies";

interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accessToken, refreshToken } = req.cookies;

    // Check if both tokens are missing - clear any stale cookies
    if (!accessToken && !refreshToken) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "No authentication tokens provided",
        code: "ACCESS_TOKEN_MISSING",
      });
    }

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token not provided",
        code: "ACCESS_TOKEN_MISSING",
      });
    }

    // Verify access token
    const decoded = jwt.verify(accessToken, env.jwtSecret) as {
      userId: string;
    };

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      // Clear cookies if user doesn't exist
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Access token expired",
        code: "ACCESS_TOKEN_EXPIRED",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      // Clear cookies on invalid token
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
        code: "ACCESS_TOKEN_INVALID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication error",
      code: "AUTH_ERROR",
    });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accessToken } = req.cookies;

    if (accessToken) {
      const decoded = jwt.verify(accessToken, env.jwtSecret) as {
        userId: string;
      };
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};
