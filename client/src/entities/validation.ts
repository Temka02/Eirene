import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email({ message: 'Введите корректный e-mail' }).max(100),
  password: z.string().min(6, { message: 'Пароль должен содержать минимум 6 символов' }),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, { message: 'Введите имя' }).max(50, 'Максимум 50 символов'),
    surname: z.string().min(1, { message: 'Введите фамилию' }).max(50, 'Максимум 50 символов'),
    email: z.email({ message: 'Введите корректный e-mail' }).max(100),
    password: z.string().min(6, { message: 'Пароль должен содержать минимум 6 символов' }),
    repeatPassword: z.string().min(1, { message: 'Повторите пароль' }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.repeatPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Пароли не совпадают',
        path: ['repeatPassword'],
      });
    }
  });

export const projectSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(50, 'Максимум 50 символов'),
  description: z.string().max(200, 'Максимум 200 символов').optional(),
  icon: z.enum(['plant', 'sun', 'waves', 'star', 'mountains', 'flower']),
});

export const taskSchema = z
  .object({
    title: z.string().min(1, 'Название задачи обязательно').max(100, 'Максимум 100 символов'),
    description: z.string().max(500, 'Максимум 500 символов').optional(),
    priority: z.enum(['high', 'medium', 'low']),
    deadlineType: z.enum(['hard', 'soft', 'none']),
    deadline: z.string().optional(),
    projectId: z.string().optional().nullable(),
    subtasks: z.array(z.string()).max(20, 'Максимум 20 подзадач').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.deadlineType !== 'none' && !data.deadline) {
      ctx.addIssue({
        code: 'custom',
        message: 'Укажите дату дедлайна',
        path: ['deadline'],
      });
    }
  });

export const profileSchema = z.object({
  name: z.string().min(1, 'Имя обязательно').max(50, 'Максимум 50 символов'),
  surname: z.string().min(1, 'Фамилия обязательна').max(50, 'Максимум 50 символов'),
  email: z.email('Некорректный email').max(100),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
