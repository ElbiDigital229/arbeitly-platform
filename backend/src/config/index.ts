import "dotenv/config";
import { z } from "zod/v4";

const envSchema = z.object({
  PORT: z.coerce.number().default(2000),
  NODE_ENV: z.enum(["development", "staging", "production"]).default("development"),

  DATABASE_URL: z.string(),
  FRONTEND_URL: z.string().default("http://localhost:2222"),

  VALKEY_URL: z.string().default("redis://localhost:6379"),
  NATS_URL: z.string().default("nats://localhost:4222"),

  AUTH0_DOMAIN: z.string(),
  AUTH0_AUDIENCE: z.string(),
  AUTH0_CLIENT_ID: z.string(),
  AUTH0_CLIENT_SECRET: z.string(),

  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),

  MINIO_ENDPOINT: z.string().default("localhost"),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_ACCESS_KEY: z.string().default("minioadmin"),
  MINIO_SECRET_KEY: z.string().default("minioadmin"),
});

export const config = envSchema.parse(process.env);
export type Config = z.infer<typeof envSchema>;
