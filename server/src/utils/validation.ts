import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().max(50).optional(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
