import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import type { AuthUser } from '../../schemas/auth.schema';

interface Props {
  children: React.ReactNode;
  /** If provided, only users with one of these roles can access. Others redirect to '/'. */
  allowedRoles?: AuthUser['role'][];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in but wrong role → back to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
