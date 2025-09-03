import { z } from "zod";

export const loginSchema = z.object({
  waId: z
    .string()
    .trim()
    .min(10, "WA ID must be exactly 10 digits")
    .max(10, "WA ID must be exactly 10 digits")
    .regex(/^\d{10}$/, "WA ID must be exactly 10 digits"),
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters")
    .max(64, "Password must be at most 64 characters"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  waId: z
    .string()
    .trim()
    .min(10, "WA ID must be exactly 10 digits")
    .max(10, "WA ID must be exactly 10 digits")
    .regex(/^\d{10}$/, "WA ID must be exactly 10 digits"),
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters")
    .max(64, "Password must be at most 64 characters"),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
