import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../ui/misc';

export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <Spinner className="min-h-dvh" />;
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

export function GuestOnly() {
  const { status } = useAuth();

  if (status === 'loading') return <Spinner className="min-h-dvh" />;
  if (status === 'authenticated') return <Navigate to="/" replace />;
  return <Outlet />;
}
