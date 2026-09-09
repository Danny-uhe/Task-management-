import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import AdminRoute     from './AdminRoute';

// Auth pages (public)
import LoginPage          from '@/features/auth/pages/LoginPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage  from '@/features/auth/pages/ResetPasswordPage';
import AcceptInvitePage   from '@/features/auth/pages/AcceptInvitePage';

// App pages (require login)
import DashboardPage    from '@/features/dashboard/pages/DashboardPage';
import TasksPage        from '@/features/tasks/pages/TasksPage';
import LeaderboardPage  from '@/features/leaderboard/pages/LeaderBoardPage';
import ActivityPage     from '@/features/activity/pages/ActivityPage';
import ArchivedPage     from '@/features/archived/pages/ArchivedPage';
import SettingsPage     from '@/features/settings/pages/SettingsPage';
import MembersPage      from '@/features/members/pages/MembersPage';
import UserProfilePage  from '@/features/profile/pages/UserProfilePage';

// Admin-only pages
import OrganisationPage from '@/features/organisation/pages/OrganisationPage';

import NotFoundPage from '@/features/shared/NotFoundPage';

const router = createBrowserRouter([
  // ── Public routes ───────────────────────────────────────────────────────────
  { path: '/',               element: <LoginPage /> },
  { path: '/login',          element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password/:token', element: <ResetPasswordPage /> },
  { path: '/invite/:token',          element: <AcceptInvitePage /> },

  // ── Authenticated routes ────────────────────────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard',     element: <DashboardPage /> },
      { path: '/tasks',         element: <TasksPage /> },
      { path: '/leaderboard',   element: <LeaderboardPage /> },
      { path: '/activity',      element: <ActivityPage /> },
      { path: '/archived',      element: <ArchivedPage /> },
      { path: '/settings',      element: <SettingsPage /> },
      { path: '/members',       element: <MembersPage /> },
      { path: '/profile/:id',   element: <UserProfilePage /> },

      // ── Admin-only routes ─────────────────────────────────────────────────
      {
        element: <AdminRoute />,
        children: [
          { path: '/organisation', element: <OrganisationPage /> },
        ],
      },
    ],
  },

  // ── 404 ─────────────────────────────────────────────────────────────────────
  { path: '*', element: <NotFoundPage /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
