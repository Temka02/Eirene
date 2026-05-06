import type { User } from '../user/model';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
