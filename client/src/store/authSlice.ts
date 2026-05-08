import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../entities/user/model';
import type { AuthResponse } from '../entities/auth/model';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,
    isLoading: false,
    error: null,
  } satisfies AuthState,
  reducers: {
    setCredentials(state: AuthState, action: PayloadAction<AuthResponse>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.error = null;
      localStorage.setItem('accessToken', action.payload.accessToken);
    },
    logout(state: AuthState) {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem('accessToken');
    },
    initialize(state: AuthState) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        state.accessToken = token;
      }
    },
    setLoading(state: AuthState, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state: AuthState, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    updateAccessToken(state: AuthState, action: PayloadAction<string>) {
      state.accessToken = action.payload;
      localStorage.setItem('accessToken', action.payload);
    },
  },
});

export const { setCredentials, logout, initialize, setLoading, setError, updateAccessToken } =
  authSlice.actions;
export default authSlice.reducer;
