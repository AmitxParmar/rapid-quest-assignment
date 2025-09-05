import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { User, type IUser } from "../models/User";

/**
 * Express request extended with authenticated user and cookies.
 */
interface AuthRequest extends Request {
  user?: IUser;
  cookies: Record<string, string>;
}

/**
 * Generate JWT access and refresh tokens for a user.
 * @param {string} userId - The user's unique identifier.
 * @returns {{ accessToken: string, refreshToken: string }} The generated tokens.
 */
const generateTokens = (
  userId: string
): { accessToken: string; refreshToken: string } => {
  const accessToken = jwt.sign({ userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as SignOptions);

  const refreshToken = jwt.sign({ userId }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  } as SignOptions);

  return { accessToken, refreshToken };
};

/**
 * Get cookie options for setting JWT cookies.
 * @param {number} maxAge - The max age of the cookie in milliseconds.
 * @param {string} [nodeEnv] - Optional node environment override.
 * @returns {object} Cookie options.
 */
const getCookieOptions = (maxAge: number, nodeEnv?: string): object => {
  const envNode = nodeEnv || env.nodeEnv;
  return {
    httpOnly: true,
    secure: envNode === "production",
    sameSite: envNode === "production" ? "none" : "lax",
    maxAge,
  } as const;
};

/**
 * Register a new user.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
export const register = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { waId, name } = req.body;

    if (!waId) {
      return res.status(400).json({
        success: false,
        message: "WhatsApp ID is required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      waId: waId.startsWith("91") ? waId : `91${waId}`,
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create new user
    const user = new User({
      waId: waId.startsWith("91") ? waId : `91${waId}`,
      name: name || `User ${waId}`,
      isOnline: true,
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(String(user._id));

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookies
    res.cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000)); // 15 minutes
    res.cookie(
      "refreshToken",
      refreshToken,
      getCookieOptions(7 * 24 * 60 * 60 * 1000)
    ); // 7 days

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        waId: user.waId,
        name: user.name,
        profilePicture: user.profilePicture,
        status: user.status,
        isOnline: user.isOnline,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Log in a user.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
export const login = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { waId } = req.body;

    if (!waId) {
      return res.status(400).json({
        success: false,
        message: "WhatsApp ID is required",
      });
    }

    // Find user
    const user = await User.findOne({
      waId: waId.startsWith("91") ? waId : `91${waId}`,
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user status
    user.isOnline = true;
    user.lastSeen = new Date();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(String(user._id));

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookies
    res.cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000)); // 15 minutes
    res.cookie(
      "refreshToken",
      refreshToken,
      getCookieOptions(7 * 24 * 60 * 60 * 1000)
    ); // 7 days

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        waId: user.waId,
        name: user.name,
        profilePicture: user.profilePicture,
        status: user.status,
        isOnline: user.isOnline,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Refresh JWT tokens using a valid refresh token.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
export const refreshToken = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { refreshToken: token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not provided",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(token, env.jwtRefreshSecret) as {
      userId: string;
    };

    // Find user and check if refresh token matches
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== token) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      String(user._id)
    );

    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new cookies
    res.cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000)); // 15 minutes
    res.cookie(
      "refreshToken",
      newRefreshToken,
      getCookieOptions(7 * 24 * 60 * 60 * 1000)
    ); // 7 days

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(403).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

/**
 * Log out a user and clear their refresh token.
 * @param {AuthRequest} req - Express request object with user and cookies.
 * @param {Response} res - Express response object.
 */
export const logout = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const { refreshToken: token } = req.cookies;

    if (token) {
      // Find user and clear refresh token
      const decoded = jwt.verify(token, env.jwtRefreshSecret) as {
        userId: string;
      };
      const user = await User.findById(decoded.userId);

      if (user) {
        user.refreshToken = undefined;
        user.isOnline = false;
        user.lastSeen = new Date();
        await user.save();
      }
    }

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get the authenticated user's profile.
 * @param {AuthRequest} req - Express request object with user.
 * @param {Response} res - Express response object.
 */
export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        waId: req.user.waId,
        name: req.user.name,
        profilePicture: req.user.profilePicture,
        status: req.user.status,
        isOnline: req.user.isOnline,
        lastSeen: req.user.lastSeen,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Update the authenticated user's profile.
 * @param {AuthRequest} req - Express request object with user.
 * @param {Response} res - Express response object.
 */
export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { name, profilePicture, status } = req.body;

    const updateData: Partial<IUser> = {};
    if (name !== undefined) updateData.name = name;
    if (profilePicture !== undefined)
      updateData.profilePicture = profilePicture;
    if (status !== undefined) updateData.status = status;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        waId: user.waId,
        name: user.name,
        profilePicture: user.profilePicture,
        status: user.status,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Update the authenticated user's password.
 *
 * This endpoint allows an authenticated user to change their password.
 *
 * @param {AuthRequest} req - Express request object with user.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} Returns a JSON response indicating success or failure:
 *   - 200: { success: true, message: "Password changed successfully" }
 *   - 400: { success: false, message: "Current password and new password are required" }
 *   - 400: { success: false, message: "New password must be at least 6 characters long" }
 *   - 401: { success: false, message: "User not authenticated" }
 *   - 401: { success: false, message: "Current password is incorrect" }
 *   - 404: { success: false, message: "User not found" }
 *   - 500: { success: false, message: "Internal server error" }
 */
export const changePassword = async (
  req: AuthRequest,
  res: Response
): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Verify current password
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
