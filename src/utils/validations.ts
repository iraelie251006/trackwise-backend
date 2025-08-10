import { z } from "zod";

export const envSchema = z.object({
  PORT: z.string().default("5000").transform(Number),
  ACCESS_TOKEN_SECRET: z
    .string()
    .min(1, { message: "ACCESS_TOKEN_SECRET is required" }),
  REFRESH_TOKEN_SECRET: z
    .string()
    .min(1, { message: "REFRESH_TOKEN_SECRET is required" }),
  ACCESS_TOKEN_EXPIRES: z.string().transform((val) => {
    const parsed = Number(val);
    if (isNaN(parsed)) {
      throw new Error("ACCESS_TOKEN_EXPIRES must be a number");
    }
    return parsed;
  }),
  REFRESH_TOKEN_EXPIRES: z.string().transform((val) => {
    const parsed = Number(val);
    if (isNaN(parsed)) {
      throw new Error("REFRESH_TOKEN_EXPIRES must be a number");
    }
    return parsed;
  }),
  AUTH_GOOGLE_ID: z.string().min(1, { message: "AUTH_GOOGLE_ID is required" }),
  AUTH_GOOGLE_SECRET: z
    .string()
    .min(1, { message: "AUTH_GOOGLE_SECRET is required" }),
  AUTH_SECRET: z.string().min(1, { message: "AUTH_SECRET is required" }),
});

export const SignUpSchema = z.object({
  name: z.string().min(3).max(50),
  email: z.string().email(),
  password: z
    .string()
    .min(6, { message: "Password must contain atleast 6 minimum characters" })
    .max(50, { message: "Password must not exceed 50 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/, {
      message:
        "Password must contain atleast one lowercase letter, one uppercase letter and one digit",
    }),
});

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6, { message: "Password must contain atleast 6 minimum characters" })
    .max(50, { message: "Password must not exceed 50 characters" }),
});
