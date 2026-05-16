import * as Sentry from '@sentry/react';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../entities/user/model';
import type { AuthResponse } from '../entities/auth/model';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isInitialized: false,
  isLoading: false,
  error: null,
};
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state: AuthState, action: PayloadAction<AuthResponse>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.error = null;
      localStorage.setItem('accessToken', action.payload.accessToken);

      if (action.payload.user) {
        Sentry.setUser({
          id: action.payload.user._id,
          email: action.payload.user.email,
          username: action.payload.user.name,
        });
      }
    },
    logout(state: AuthState) {
      state.user = null;
      state.accessToken = null;
      state.isInitialized = true;
      localStorage.removeItem('accessToken');

      Sentry.setUser(null);
    },
    initialize(state: AuthState) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        state.accessToken = token;
      }
      state.isInitialized = true;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
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

export const {
  setCredentials,
  logout,
  initialize,
  setUser,
  setLoading,
  setError,
  updateAccessToken,
} = authSlice.actions;
export default authSlice.reducer;
