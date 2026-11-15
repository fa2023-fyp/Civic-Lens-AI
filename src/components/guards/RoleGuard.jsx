import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export function RoleGuard({ roles = [], ownerId, children }) {
  const { user, sessionExpired, expiredPath, expiredRole, expiredUserId } = useAuth();
  const location = useLocation();
  const params = useParams();
  const guardUser = user ?? (sessionExpired ? { id: expiredUserId, role: expiredRole } : null);
  const resolvedOwnerId =
    guardUser && typeof ownerId === 'function' ? ownerId({ user: guardUser, params }) : ownerId;

  if (
    sessionExpired &&
    location.pathname === expiredPath &&
    roles.includes(expiredRole) &&
    (resolvedOwnerId == null || String(resolvedOwnerId) === String(expiredUserId))
  ) {
    return children;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  if (resolvedOwnerId != null && String(resolvedOwnerId) !== String(user.id)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
