import { z } from "zod";

export const envSchema = z.object({
  PORT: z.string().default("5000").transform(Number),
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