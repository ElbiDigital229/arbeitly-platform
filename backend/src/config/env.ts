import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required for CV parsing'),
  FRONTEND_URL: z.string().default('http://localhost:2222'),
  MINIO_ENDPOINT: z.string().default('localhost'),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_USE_SSL: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
  MINIO_ACCESS_KEY: z.string().default('minioadmin'),
  MINIO_SECRET_KEY: z.string().default('minioadmin'),
  MINIO_BUCKET: z.string().default('arbeitly'),
  VALKEY_URL: z.string().default('redis://localhost:6379'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_STARTER: z.string().default('price_placeholder'),
  STRIPE_PRICE_PROFESSIONAL: z.string().default('price_placeholder'),
  STRIPE_PRICE_ENTERPRISE: z.string().default('price_placeholder'),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
