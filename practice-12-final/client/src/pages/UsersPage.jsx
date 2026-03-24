import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import '../pages/CarsPage/CarsPage.scss';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const loadUsers = () => apiClient.get('/users').then(r => setUsers(r.data));
  useEffect(() => { loadUsers(); }, []);

  const handleBlock = async (id) => {
    if (!window.confirm('Заблокировать пользователя?')) return;
    await apiClient.delete(`/users/${id}`);
    loadUsers();
  };

  const handleRoleChange = async (id, role) => {
    await apiClient.put(`/users/${id}`, { role });
    loadUsers();
  };

  return (
    <div className="page">
      <header className="header">
        <div className="header__inner">
          <span className="brand">👥 Пользователи</span>
          <button className="btn" onClick={() => navigate('/cars')}>← Назад</button>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="toolbar">
            <h2 className="title">Управление пользователями</h2>
          </div>

          <div className="list">
            {users.map(u => (
              <div key={u.id} className="carRow">
                <div className="carMain">
                  <span className="carName">{u.first_name} {u.last_name}</span>
                  <span className="carCategory">{u.email}</span>
                  <div className="carMeta">
                    <span className={u.blocked ? 'carStock' : 'carPrice'}>
                      {u.blocked ? '🔴 Заблокирован' : '🟢 Активен'}
                    </span>
                  </div>
                </div>
                <div className="carActions">
                  <select
                    className="input"
                    value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                    style={{ padding: '6px 10px', fontSize: 13 }}
                  >
                    <option value="user">user</option>
                    <option value="seller">seller</option>
                    <option value="admin">admin</option>
                  </select>
                  {!u.blocked && (
                    <button className="btn btn--danger" onClick={() => handleBlock(u.id)}>
                      🚫 Блокировать
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer__inner">Cars App © 2026</div>
      </footer>
    </div>
  );
}
