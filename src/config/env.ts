import { config } from "dotenv";
import { envSchema } from "../utils/validations";

config({ path: ".env" });

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables");
}

export const { PORT } = _env.data;
