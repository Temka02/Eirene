import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email({ message: 'Введите корректный e-mail' }),
  password: z.string().min(6, { message: 'Пароль должен содержать минимум 6 символов' }),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, { message: 'Введите имя' }),
    surname: z.string().min(1, { message: 'Введите фамилию' }),
    email: z.email({ message: 'Введите корректный e-mail' }),
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

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
