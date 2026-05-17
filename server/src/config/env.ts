import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.url(),
  PREVIEW_PROD_CLIENT_URL: z.url(),
  MONGO_URI: z.string().startsWith('mongodb'),
  JWT_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
});

export const env = envSchema.parse(process.env);
