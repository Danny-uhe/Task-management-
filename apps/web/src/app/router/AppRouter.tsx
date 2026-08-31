import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import TasksPage from '@/features/tasks/pages/TasksPage';
import LeaderboardPage from '@/features/leaderboard/pages/LeaderBoardPage';
import ActivityPage from '@/features/activity/pages/ActivityPage';
import ArchivedPage from '@/features/archived/pages/ArchivedPage';
import SettingsPage from '@/features/settings/pages/SettingsPage';
import MembersPage from '@/features/members/pages/MembersPage';
import OrganisationPage from '@/features/organisation/pages/OrganisationPage';
import UserProfilePage from '@/features/profile/pages/UserProfilePage';
import NotFoundPage from '@/features/shared/NotFoundPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/tasks',
    element: <TasksPage />,
  },
  {
    path: '/leaderboard',
    element: <LeaderboardPage />,
  },
  {
    path: '/activity',
    element: <ActivityPage />,
  },
  {
    path: '/archived',
    element: <ArchivedPage />,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
  },
  
  {
    path: '/organisation',
    element: <OrganisationPage />,
  },
  {
    path: '/members',
    element: <MembersPage />,
  },
  {
    path: '/profile/:id',
    element: <UserProfilePage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
