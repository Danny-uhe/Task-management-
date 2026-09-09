import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/**
 * AdminRoute — allows only system admins.
 * Must be nested inside ProtectedRoute.
 */
export default function AdminRoute() {
  const user        = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  if (!hasHydrated) {
    return null;
  }

  if (user?.systemRole !== 'admin') {
    return <Navigate to='/dashboard' replace />;
  }

  return <Outlet />;
}
