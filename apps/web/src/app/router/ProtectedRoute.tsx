import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/**
 * ProtectedRoute — redirects to /login if the user is not authenticated.
 * Wrap all app routes with this.
 */
export default function ProtectedRoute() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user        = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  // Wait for the persisted auth state to load from localStorage before
  // deciding — otherwise a hard refresh always sees the pre-hydration
  // `null` values and bounces a logged-in user to /login.
  if (!hasHydrated) {
    return null;
  }

  if (!accessToken || !user) {
    return <Navigate to='/login' replace />;
  }

  return <Outlet />;
}
