import { StrictMode, useEffect, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Provider, useDispatch } from 'react-redux';
import { store, type AppDispatch } from './store/index.ts';
import { RouterProvider } from 'react-router-dom';
import { router } from './shared/router/router';
import { initialize, logout, setUser } from './store/authSlice';
import { authApi } from './features/auth/authApi.ts';

function AppInit({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
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
