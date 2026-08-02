import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(8787),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  /** When true, skip DB writes (useful for local smoke without Postgres). */
  PROXY_DRY_RUN: z
    .string()
    .optional()
    .transform((v) => v === '1' || v === 'true'),
  /** Dev-only static API key accepted when DB is unavailable. */
  DEV_API_KEY: z.string().optional().default('ts_dev_local_key'),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  cached = envSchema.parse(process.env);
  return cached;
}

export function resetEnvCache() {
  cached = null;
}
