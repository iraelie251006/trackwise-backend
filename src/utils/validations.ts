import { z } from "zod";

export const envSchema = z.object({
    PORT: z.string().default("5000").transform(Number),
});