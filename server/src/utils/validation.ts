import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, { message: 'Введите имя' }).max(50),
  surname: z.string().min(1, { message: 'Введите фамилию' }).max(50),
  email: z.email({ message: 'Некорректный e-mail' }),
  password: z.string().min(6, { message: 'Пароль должен содержать минимум 6 символов' }),
});

export const loginSchema = z.object({
  email: z.email({ message: 'Некорректный e-mail' }),
  password: z.string().min(6, { message: 'Пароль должен содержать минимум 6 символов' }),
});

export const taskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  deadlineType: z.enum(['hard', 'soft', 'none']).default('none'),
  deadline: z.coerce.date().optional(),
  projectId: z.string().optional().nullable(),
});

export const updateTaskSchema = taskSchema.partial();

export const addSubtaskSchema = z.object({
  title: z.string().min(1).max(100),
});

export const updateSubtaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  isCompleted: z.boolean().optional(),
});

export const projectSchema = z.object({
  title: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  icon: z.enum(['plant', 'sun', 'waves', 'star', 'mountains', 'flower']).optional(),
});

export const updateProjectSchema = projectSchema.partial();

export type TaskInput = z.infer<typeof taskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AddSubtaskInput = z.infer<typeof addSubtaskSchema>;
export type UpdateSubtaskInput = z.infer<typeof updateSubtaskSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
