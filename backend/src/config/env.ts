import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),
  REDIS_URL: z.string().min(1),

  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CALLBACK_URL: z.string().min(1),

  ETHEREAL_USER: z.string().min(1),
  ETHEREAL_PASS: z.string().min(1),

  MAX_EMAILS_PER_HOUR: z.coerce.number().positive().default(10),
  WORKER_CONCURRENCY: z.coerce.number().positive().default(2),
  EMAIL_DELAY_MS: z.coerce.number().nonnegative().default(2000),

  SESSION_SECRET: z.string().min(16),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  FRONTEND_URL: z.string().min(1).default("http://localhost:3000"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌  Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
