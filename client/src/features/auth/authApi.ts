import { api } from '../../store/api';
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from '../../entities/auth/model';
import type { User } from '../../entities/user/model';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        data: credentials,
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterCredentials>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        data: credentials,
      }),
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    getMe: builder.query<{ user: User }, void>({
      query: () => ({
        url: '/auth/me',
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation, useGetMeQuery } = authApi;
