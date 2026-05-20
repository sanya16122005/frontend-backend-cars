import { useEffect } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

import { useAuth } from './hooks/useAuth.js';
import { useToasts, ToastHost } from './hooks/useToasts.jsx';

import LoginPage    from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import KanbanPage   from './pages/KanbanPage.jsx';
import UsersPage    from './pages/UsersPage.jsx';

import PrivateRoute from './components/PrivateRoute.jsx';
import PushToggle   from './components/PushToggle.jsx';

export default function App() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { toasts, push } = useToasts();

  // Socket.IO для real-time событий между вкладками и инстансами
  useEffect(() => {
    if (!auth.user) return;
    
    const socket = io({ path: '/socket.io' });
    window.socket = socket; // Экспортируем в окно для доступа из KanbanPage

    socket.on('taskCreated', (task) => push(`🆕 Добавлена задача: "${task.title}" (для ${task.car_model})`));
    socket.on('taskUpdated', (task) => push(`✏️ Обновлена задача: "${task.title}" (статус: ${task.status})`));
    socket.on('taskDeleted', (data) => push(`🗑️ Задача #${data.id} удалена`));
    
    return () => {
      socket.disconnect();
      window.socket = null;
    };
  }, [auth.user, push]);

  function logout() { auth.logout(); navigate('/login', { replace: true }); }

  return (
    <>
      <header className="header">
        <div className="header__brand">🚗 Автосервис — Kanban & Collab (КР5)</div>

        <nav className="header__nav">
          {auth.user && (
            <>
              <NavLink to="/kanban"  className={({isActive}) => isActive ? 'header__link active' : 'header__link'}>Kanban-доска</NavLink>
              {auth.role === 'admin' && (
                <NavLink to="/users" className={({isActive}) => isActive ? 'header__link active' : 'header__link'}>Пользователи</NavLink>
              )}
              <a className="header__link" href="/api-docs" target="_blank" rel="noreferrer">Swagger API</a>
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
        <Route path="/"         element={<Navigate to={auth.user ? '/kanban' : '/login'} replace />} />
        <Route path="/login"    element={<LoginPage    auth={auth} />} />
        <Route path="/register" element={<RegisterPage auth={auth} />} />

        <Route path="/kanban"  element={
          <PrivateRoute user={auth.user} roles={['user','seller','admin']}>
            <KanbanPage role={auth.role} pushToast={push} />
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
        🚗 Автосервис — Финальный проект КР5 (на базе КР1-КР4): Kanban Board · WebSockets Collab · PWA · Web Push · PostgreSQL · Redis · Nginx Balance · Docker Compose
      </footer>

      <ToastHost toasts={toasts} />
    </>
  );
}

