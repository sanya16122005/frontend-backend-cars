import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', password: '' });
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
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 20 }}>
      <h2>Регистрация</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input name="email"      value={form.email}      onChange={handleChange} placeholder="Email"    type="email"    required />
        <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="Имя"                     required />
        <input name="last_name"  value={form.last_name}  onChange={handleChange} placeholder="Фамилия"                 required />
        <input name="password"   value={form.password}   onChange={handleChange} placeholder="Пароль"  type="password" required />
        <button type="submit">Зарегистрироваться</button>
      </form>
      <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
    </div>
  );
}
