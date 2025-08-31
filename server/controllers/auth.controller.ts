import { Request, Response } from "express";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { User, type IUser } from "../models/User";

interface AuthRequest extends Request {
  user?: IUser;
  cookies: Record<string, any>;
}

// Generate JWT tokens
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId },
    env.jwtSecret as Secret,
    { expiresIn: env.jwtExpiresIn } as SignOptions
  );

  const refreshToken = jwt.sign(
    { userId },
    env.jwtRefreshSecret as Secret,
    { expiresIn: env.jwtRefreshExpiresIn } as SignOptions
  );

  return { accessToken, refreshToken };
};

// Set cookie options
const getCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "strict" as const,
  maxAge,
});

export const register = async (req: Request, res: Response) => {
  try {
    const { waId, name, password } = req.body;

    if (!waId) {
      return res.status(400).json({
        success: false,
        message: "WhatsApp ID is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
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
      password,
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

    res.status(201).json({
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
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { waId, password } = req.body;

    if (!waId) {
      return res.status(400).json({
        success: false,
        message: "WhatsApp ID is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
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

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
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

    res.status(200).json({
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
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const cookies = req.cookies as { [key: string]: string } | undefined;
    const token = cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not provided",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(token, env.jwtRefreshSecret as Secret) as {
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

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(403).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const cookies = req.cookies as { [key: string]: string } | undefined;
    const token = cookies?.refreshToken;

    if (token) {
      // Find user and clear refresh token
      const decoded = jwt.verify(token, env.jwtRefreshSecret as Secret) as {
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

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: req.user._id,
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
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
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

    res.status(200).json({
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
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
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

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
