import { z } from "zod";

const waIdSchema = z
  .string()
  .trim()
  .refine(
    (val) =>
      (/^91\d{10}$/.test(val) && val.length === 12) ||
      (/^\d{10}$/.test(val) && val.length === 10),
    {
      message:
        "WA ID must be exactly 10 digits, or 12 digits if starting with 91",
    }
  );

export const loginSchema = z.object({
  waId: waIdSchema,
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters")
    .max(64, "Password must be at most 64 characters"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  waId: waIdSchema,
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
