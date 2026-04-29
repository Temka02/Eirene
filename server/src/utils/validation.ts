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

export const taskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  deadlineType: z.enum(['hard', 'soft', 'none']).default('none'),
  deadline: z.coerce.date().optional(),
});

export const updateTaskSchema = taskSchema.partial();

export const addSubtaskSchema = z.object({
  title: z.string().min(1).max(100),
});

export const updateSubtaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  isCompleted: z.boolean().optional(),
});

export type TaskInput = z.infer<typeof taskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AddSubtaskInput = z.infer<typeof addSubtaskSchema>;
export type UpdateSubtaskInput = z.infer<typeof updateSubtaskSchema>;
