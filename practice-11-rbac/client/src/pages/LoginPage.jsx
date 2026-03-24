import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      navigate('/cars');
    } catch {
      setError('Неверный email или пароль');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 20 }}>
      <h2>Вход</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" required />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" type="password" required />
        <button type="submit">Войти</button>
      </form>
      <p>Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
    </div>
  );
}
