import { lazy } from 'react';

export const DashboardPage = lazy(() => import('../../pages/dashboard/DashboardPage'));
export const ProjectsPage = lazy(() => import('../../pages/projects/ProjectsPage'));
export const ProjectDetailsPage = lazy(() => import('../../pages/projects/ProjectDetailsPage'));
export const CreateProjectPage = lazy(() => import('../../pages/projects/CreateProjectPage'));
export const EditProjectPage = lazy(() => import('../../pages/projects/EditProjectPage'));
export const TasksPage = lazy(() => import('../../pages/tasks/TasksPage'));
export const TaskDetailsPage = lazy(() => import('../../pages/tasks/TaskDetailsPage'));
export const CreateTaskPage = lazy(() => import('../../pages/tasks/CreateTaskPage'));
export const EditTaskPage = lazy(() => import('../../pages/tasks/EditTaskPage'));
export const NotificationsPage = lazy(() => import('../../pages/notifications/NotificationsPage'));
export const SettingsPage = lazy(() => import('../../pages/settings/SettingsPage'));
export const CalendarPage = lazy(() => import('../../pages/calendar/CalendarPage'));
export const FocusModePage = lazy(() => import('../../pages/focus/FocusModePage'));
export const NotFoundPage = lazy(() => import('../../pages/NotFoundPage'));
export const LoginPage = lazy(() => import('../../pages/auth/LoginPage'));
export const RegisterPage = lazy(() => import('../../pages/auth/RegisterPage'));
export const LandingPage = lazy(() => import('../../pages/auth/LandingPage'));
