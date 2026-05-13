import { useEffect } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

import { useAuth } from './hooks/useAuth.js';
import { useToasts, ToastHost } from './hooks/useToasts.js';

import LoginPage    from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import CarsPage     from './pages/CarsPage.jsx';
import UsersPage    from './pages/UsersPage.jsx';

import PrivateRoute from './components/PrivateRoute.jsx';
import PushToggle   from './components/PushToggle.jsx';

export default function App() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { toasts, push } = useToasts();

  // Socket.IO для real-time toast'ов между вкладками
  useEffect(() => {
    if (!auth.user) return;
    const socket = io({ path: '/socket.io' });
    socket.on('carCreated', (car) => push(`🆕 Добавлено: ${car.brand} ${car.model}`));
    socket.on('carUpdated', (car) => push(`✏️ Обновлено: ${car.brand} ${car.model}`));
    socket.on('carDeleted', (data) => push(`🗑️ Удалено #${data.id}`));
    return () => socket.disconnect();
  }, [auth.user, push]);

  function logout() { auth.logout(); navigate('/login', { replace: true }); }

  return (
    <>
      <header className="header">
        <div className="header__brand">🚗 Cars — итоговый проект</div>

        <nav className="header__nav">
          {auth.user && (
            <>
              <NavLink to="/cars"  className={({isActive}) => isActive ? 'header__link active' : 'header__link'}>Каталог</NavLink>
              {auth.role === 'admin' && (
                <NavLink to="/users" className={({isActive}) => isActive ? 'header__link active' : 'header__link'}>Пользователи</NavLink>
              )}
              <a className="header__link" href="/api-docs" target="_blank" rel="noreferrer">Swagger</a>
              <PushToggle />
              <span className="header__user">{auth.user.email} · <strong>{auth.user.role}</strong></span>
              <button className="btn" onClick={logout}>Выйти</button>
            </>
          )}
          {!auth.user && (
            <>
              <NavLink to="/login"    className={({isActive}) => isActive ? 'header__link active' : 'header__link'}>Войти</NavLink>
              <NavLink to="/register" className={({isActive}) => isActive ? 'header__link active' : 'header__link'}>Регистрация</NavLink>
            </>
          )}
        </nav>
      </header>

      <Routes>
        <Route path="/"         element={<Navigate to={auth.user ? '/cars' : '/login'} replace />} />
        <Route path="/login"    element={<LoginPage    auth={auth} />} />
        <Route path="/register" element={<RegisterPage auth={auth} />} />

        <Route path="/cars"  element={
          <PrivateRoute user={auth.user} roles={['user','seller','admin']}>
            <CarsPage role={auth.role} pushToast={push} />
          </PrivateRoute>
        } />
        <Route path="/users" element={
          <PrivateRoute user={auth.user} roles={['admin']}>
            <UsersPage pushToast={push} />
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <footer className="footer">
        🚗 Cars — итог КР1+КР2+КР3+КР4: React UI · JWT+RBAC · Swagger · PWA · Push · PostgreSQL · Redis · Nginx LB · Docker
      </footer>

      <ToastHost toasts={toasts} />
    </>
  );
}
