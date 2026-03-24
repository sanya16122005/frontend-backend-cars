import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import '../auth.scss';

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
    <div className="authPage">
      <div className="authCard">
        <div className="authCard__header">
          <span className="authCard__logo">🚗</span>
          <h2 className="authCard__title">Вход</h2>
          <p className="authCard__sub">Войдите в свой аккаунт</p>
        </div>
        {error && <div className="authAlert">{error}</div>}
        <form onSubmit={handleLogin} className="authForm">
          <label className="label">Email
            <input className="input" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" required />
          </label>
          <label className="label">Пароль
            <input className="input" value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" required />
          </label>
          <button type="submit" className="btn btn--primary authBtn">Войти</button>
        </form>
        <p className="authCard__foot">Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
      </div>
    </div>
  );
}
