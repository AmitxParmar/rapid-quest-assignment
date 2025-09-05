import { Response } from "express";
import { env } from "../config/env";

/**
 * Get standardized cookie options for JWT cookies
 */
export const getCookieOptions = (maxAge: number, nodeEnv?: string) => {
  const envNode = nodeEnv || env.nodeEnv;
  return {
    httpOnly: true,
    secure: envNode === "production",
    sameSite: (envNode === "production" ? "none" : "lax") as "none" | "lax",
    maxAge,
    path: "/",
  };
};

/**
 * Clear authentication cookies with proper options
 */
export const clearAuthCookies = (res: Response) => {
  const cookieOptions = {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: (env.nodeEnv === "production" ? "none" : "lax") as "none" | "lax",
    path: "/",
  };
  
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
};

/**
 * Set authentication cookies
 */
export const setAuthCookies = (
  res: Response, 
  accessToken: string, 
  refreshToken: string
) => {
  res.cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000)); // 15 minutes
  res.cookie("refreshToken", refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000)); // 7 days
};