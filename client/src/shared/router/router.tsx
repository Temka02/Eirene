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
import SettingsPage from '../../pages/settings/SettingsPage';
import CalendarPage from '../../pages/calendar/CalendarPage';

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
    path: 'focus/:id',
    element: (
      <ProtectedRoute>
        <FocusModePage />
      </ProtectedRoute>
    ),
  },

  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <DashboardPage /> },

      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:id', element: <ProjectDetailsPage /> },
      { path: 'projects/create', element: <CreateProjectPage /> },
      { path: 'projects/:id/edit', element: <EditProjectPage /> },

      { path: 'tasks', element: <TasksPage /> },
      { path: 'tasks/:id', element: <TaskDetailsPage /> },
      { path: 'tasks/create', element: <CreateTaskPage /> },
      { path: 'tasks/:id/edit', element: <EditTaskPage /> },

      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'calendar', element: <CalendarPage /> },
    ],
  },

  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export const router = createBrowserRouter(routes);
