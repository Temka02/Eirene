import { createBrowserRouter } from 'react-router-dom';

import { lazy } from 'react';

const DashboardPage = lazy(() => import('../../pages/dashboard/DashboardPage'));
const ProjectsPage = lazy(() => import('../../pages/projects/ProjectsPage'));
const ProjectDetailsPage = lazy(() => import('../../pages/projects/ProjectDetailsPage'));
const CreateProjectPage = lazy(() => import('../../pages/projects/CreateProjectPage'));
const EditProjectPage = lazy(() => import('../../pages/projects/EditProjectPage'));
const TasksPage = lazy(() => import('../../pages/tasks/TasksPage'));
const TaskDetailsPage = lazy(() => import('../../pages/tasks/TaskDetailsPage'));
const CreateTaskPage = lazy(() => import('../../pages/tasks/CreateTaskPage'));
const EditTaskPage = lazy(() => import('../../pages/tasks/EditTaskPage'));
const NotificationsPage = lazy(() => import('../../pages/notifications/NotificationsPage'));
const SettingsPage = lazy(() => import('../../pages/settings/SettingsPage'));
const CalendarPage = lazy(() => import('../../pages/calendar/CalendarPage'));
const FocusModePage = lazy(() => import('../../pages/focus/FocusModePage'));
const NotFoundPage = lazy(() => import('../../pages/NotFoundPage'));
const LoginPage = lazy(() => import('../../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../../pages/auth/RegisterPage'));
const LandingPage = lazy(() => import('../../pages/auth/LandingPage'));
const ProtectedRoute = lazy(() => import('../../components/ProtectedRoute'));
const PublicRoute = lazy(() => import('../../components/PublicRoute'));
const MainLayout = lazy(() => import('../../layouts/MainLayout'));

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
