import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage({ auth }) {
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [busy, setBusy]   = useState(false);
  const navigate = useNavigate();

  function update(field, value) { setForm(f => ({ ...f, [field]: value })); }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await auth.register(form);
      navigate('/cars', { replace: true });
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка регистрации');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth" onSubmit={submit}>
      <h1>🚗 Регистрация</h1>

      <div className="field">
        <label className="field__label">Email</label>
        <input className="input" type="email" value={form.email} onChange={e => update('email', e.target.value)} required />
      </div>
      <div className="field">
        <label className="field__label">Имя</label>
        <input className="input" value={form.first_name} onChange={e => update('first_name', e.target.value)} required />
      </div>
      <div className="field">
        <label className="field__label">Фамилия</label>
        <input className="input" value={form.last_name} onChange={e => update('last_name', e.target.value)} required />
      </div>
      <div className="field">
        <label className="field__label">Пароль</label>
        <input className="input" type="password" value={form.password} onChange={e => update('password', e.target.value)} required />
      </div>
      <div className="field">
        <label className="field__label">Роль</label>
        <select className="select" value={form.role} onChange={e => update('role', e.target.value)}>
          <option value="user">user — просмотр</option>
          <option value="seller">seller — добавление и редактирование авто</option>
          <option value="admin">admin — полный доступ</option>
        </select>
      </div>

      {error && <div className="error">{error}</div>}

      <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
        {busy ? 'Регистрируемся…' : 'Зарегистрироваться'}
      </button>
      <p style={{ textAlign: 'center', fontSize: 13 }} className="muted">
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </form>
  );
}
