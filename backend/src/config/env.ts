import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().transform(Number).default('5000'),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().default('assetflow_super_secret_jwt_key_for_hackathon'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REDIS_URL: z.string().optional().default('redis://localhost:6379'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
