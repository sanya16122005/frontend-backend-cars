import { Navigate } from 'react-router-dom';

// requiredRole необязателен — если передан, проверяем роль из токена
export default function PrivateRoute({ children, requiredRoles }) {
  const token = localStorage.getItem('accessToken');
  if (!token) return <Navigate to="/login" />;

  if (requiredRoles) {
    // декодируем payload без верификации (только для UI)
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!requiredRoles.includes(payload.role)) return <Navigate to="/cars" />;
  }
  return children;
}
