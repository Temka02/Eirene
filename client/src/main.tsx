import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Provider } from 'react-redux';
import { store } from './store/index.ts';
import { RouterProvider } from 'react-router-dom';
import { router } from './shared/router/router';
import { AppInit } from './AppInit.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AppInit>
        <RouterProvider router={router} />
      </AppInit>
    </Provider>
  </StrictMode>
);
