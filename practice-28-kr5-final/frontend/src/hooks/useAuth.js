import { useEffect, useState } from 'react';
import api from '../api/client.js';

function decodeJwt(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch { return null; }
}

export function useAuth() {
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('accessToken');
    return t ? decodeJwt(t) : null;
  });
  const [loading, setLoading] = useState(false);

  // Подгружаем актуальные данные о пользователе
  useEffect(() => {
    if (!user) return;
    let aborted = false;
    setLoading(true);
    api.get('/auth/me')
      .then(res => { if (!aborted) setUser(prev => ({ ...prev, ...res.data })); })
      .catch(() => { if (!aborted) logout(); })
      .finally(() => { if (!aborted) setLoading(false); });
    return () => { aborted = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken',  data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    const payload = decodeJwt(data.accessToken);
    setUser(payload);
    return payload;
  }

  async function register(form) {
    await api.post('/auth/register', form);
    return login(form.email, form.password);
  }

  function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }

  const role = user?.role || null;
  const hasRole = (...roles) => roles.includes(role);

  return { user, role, hasRole, loading, login, register, logout };
}
