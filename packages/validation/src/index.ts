import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username must be at most 30 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email format"),
  code: z.string().length(6, "Code must be exactly 6 digits"),
});

export const executeOrderSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  side: z.enum(['BUY', 'SELL']),
  quantity: z.number().positive("Quantity must be greater than 0"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ExecuteOrderInput = z.infer<typeof executeOrderSchema>;
