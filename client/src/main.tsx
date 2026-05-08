import { StrictMode, useEffect, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store/index.ts';
import { RouterProvider } from 'react-router-dom';
import { router } from './shared/router/router';
import { initialize } from './store/authSlice';

function AppInit({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(initialize());
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
