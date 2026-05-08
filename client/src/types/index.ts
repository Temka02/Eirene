import type { RegisterCredentials } from '../entities/auth/model';

export type RegisterFormValues = RegisterCredentials & { repeatPassword: string };
