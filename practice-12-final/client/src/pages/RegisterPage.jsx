import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import '../auth.scss';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка регистрации');
    }
  };

  return (
    <div className="authPage">
      <div className="authCard">
        <div className="authCard__header">
          <span className="authCard__logo">🚗</span>
          <h2 className="authCard__title">Регистрация</h2>
          <p className="authCard__sub">Создайте новый аккаунт</p>
        </div>
        {error && <div className="authAlert">{error}</div>}
        <form onSubmit={handleRegister} className="authForm">
          <label className="label">Email
            <input className="input" name="email" value={form.email} onChange={handleChange} type="email" placeholder="you@example.com" required />
          </label>
          <label className="label">Имя
            <input className="input" name="first_name" value={form.first_name} onChange={handleChange} placeholder="Иван" required />
          </label>
          <label className="label">Фамилия
            <input className="input" name="last_name" value={form.last_name} onChange={handleChange} placeholder="Иванов" required />
          </label>
          <label className="label">Пароль
            <input className="input" name="password" value={form.password} onChange={handleChange} type="password" placeholder="••••••••" required />
          </label>
          <label className="label">Роль
            <select className="input" name="role" value={form.role} onChange={handleChange}>
              <option value="user">Пользователь</option>
              <option value="seller">Продавец</option>
              <option value="admin">Администратор</option>
            </select>
          </label>
          <button type="submit" className="btn btn--primary authBtn">Зарегистрироваться</button>
        </form>
        <p className="authCard__foot">Уже есть аккаунт? <Link to="/login">Войти</Link></p>
      </div>
    </div>
  );
}
