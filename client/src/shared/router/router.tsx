import { createBrowserRouter } from 'react-router-dom';

import ProtectedRoute from '../../components/ProtectedRoute';
import PublicRoute from '../../components/PublicRoute';

import MainLayout from '../../layouts/MainLayout';
import DashboardPage from '../../pages/dashboard/DashboardPage';
import NotFoundPage from '../../pages/NotFoundPage';
import NotificationsPage from '../../pages/notifications/NotificationsPage';

import { LandingPage, LoginPage, RegisterPage } from '../../pages/auth';
import {
  ProjectsPage,
  CreateProjectPage,
  EditProjectPage,
  ProjectDetailsPage,
} from '../../pages/projects';
import { TasksPage, CreateTaskPage, EditTaskPage, TaskDetailsPage } from '../../pages/tasks';
import FocusModePage from '../../pages/focus/FocusModePage';

const routes = [
  {
    path: '/',
    element: (
      <PublicRoute>
        <LandingPage />
      </PublicRoute>
    ),
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },

  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'dashboard', element: <DashboardPage /> },

      { path: 'projects', element: <ProjectsPage /> },
      { path: 'project/:id', element: <ProjectDetailsPage /> },
      { path: 'project/create', element: <CreateProjectPage /> },
      { path: 'project/:id/edit', element: <EditProjectPage /> },

      { path: 'tasks', element: <TasksPage /> },
      { path: 'task/:id', element: <TaskDetailsPage /> },
      { path: 'task/create', element: <CreateTaskPage /> },
      { path: 'task/:id/edit', element: <EditTaskPage /> },

      { path: 'notifications', element: <NotificationsPage /> },
    ],
  },

  {
    path: 'focus/:id',
    element: <FocusModePage />,
  },

  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export const router = createBrowserRouter(routes);
