import { useEffect, type ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from './store';
import { initialize, logout, setUser } from './store/authSlice';
import { authApi } from './features/auth/authApi.ts';

interface AppInitProps {
  children: ReactNode;
}

export function AppInit({ children }: AppInitProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isInitialized = useSelector((state: RootState) => state.auth.isInitialized);

  useEffect(() => {
    dispatch(initialize());
    const token = localStorage.getItem('accessToken');
    if (token) {
      dispatch(authApi.endpoints.getMe.initiate())
        .unwrap()
        .then((response) => {
          dispatch(setUser(response.user));
        })
        .catch(() => {
          dispatch(logout());
        });
    }
  }, [dispatch]);
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FEFCF9]">
        <div className="w-8 h-8 border-4 border-[#8CA693] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return children;
}
