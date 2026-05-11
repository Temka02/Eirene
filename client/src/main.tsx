import { StrictMode, useEffect, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, type AppDispatch, type RootState } from './store/index.ts';
import { RouterProvider } from 'react-router-dom';
import { router } from './shared/router/router';
import { initialize, logout, setUser } from './store/authSlice';
import { authApi } from './features/auth/authApi.ts';

function AppInit({ children }: { children: ReactNode }) {
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
  }, []);
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FEFCF9]">
        <div className="w-8 h-8 border-4 border-[#8CA693] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return children;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AppInit>
        <RouterProvider router={router} />
      </AppInit>
    </Provider>
  </StrictMode>
);
