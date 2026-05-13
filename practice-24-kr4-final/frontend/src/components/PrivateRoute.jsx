import { Navigate, useLocation } from 'react-router-dom';

export default function PrivateRoute({ user, roles, children }) {
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/cars" replace />;
  return children;
}
