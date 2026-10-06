import { z } from "zod"

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  AUTH_SECRET: z.string().min(32),
  MONGODB_URI: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  PORT: z.coerce.number().default(4000),
  SERVER_URL: z.string().url().default("http://localhost:4000"),
  NEXT_PUBLIC_SERVER_URL: z.string().url().default("http://localhost:4000"),
  SEED_ADMIN_EMAIL: z.email().default("admin@realtime.dev"),
  SEED_ADMIN_PASSWORD: z.string().min(8).default("admin123456"),
})

export type Env = z.infer<typeof envSchema>

export function validateEnv(config: Record<string, unknown>): Env {
  return envSchema.parse(config)
}