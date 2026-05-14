import { api } from '../../store/api';
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from '../../entities/auth/model';
import type { UpdateMeDto, User } from '../../entities/user/model';

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
      invalidatesTags: ['User'],
    }),
    getMe: builder.query<{ user: User }, void>({
      query: () => ({
        url: '/auth/me',
      }),
      providesTags: ['User'],
    }),
    updateMe: builder.mutation<{ user: User }, UpdateMeDto>({
      query: (data) => ({
        url: '/auth/me',
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
  useUpdateMeMutation,
} = authApi;
