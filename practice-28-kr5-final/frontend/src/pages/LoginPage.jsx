import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export default function LoginPage({ auth }) {
  const [email, setEmail]       = useState('admin@cars.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError]       = useState('');
  const [busy, setBusy]         = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/cars';

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await auth.login(email, password);
      navigate(from, { replace: true });
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка входа');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth" onSubmit={submit}>
      <h1>🚗 Вход</h1>
      <p className="muted">Демо-аккаунт уже подставлен: admin@cars.local / admin123</p>

      <div className="field">
        <label className="field__label">Email</label>
        <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div className="field">
        <label className="field__label">Пароль</label>
        <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>

      {error && <div className="error">{error}</div>}

      <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
        {busy ? 'Входим…' : 'Войти'}
      </button>
      <p style={{ textAlign: 'center', fontSize: 13 }} className="muted">
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </form>
  );
}
