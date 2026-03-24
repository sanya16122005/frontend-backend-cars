import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

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
    <div style={{ maxWidth: 900, margin: '20px auto', padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <button onClick={() => navigate('/cars')}>← Назад</button>
        <h2>👥 Пользователи</h2>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={th}>Email</th>
            <th style={th}>Имя</th>
            <th style={th}>Роль</th>
            <th style={th}>Статус</th>
            <th style={th}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td style={td}>{u.email}</td>
              <td style={td}>{u.first_name} {u.last_name}</td>
              <td style={td}>
                <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}>
                  <option value="user">user</option>
                  <option value="seller">seller</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td style={td}>{u.blocked ? '🔴 Заблокирован' : '🟢 Активен'}</td>
              <td style={td}>
                {!u.blocked && (
                  <button onClick={() => handleBlock(u.id)}>🚫 Блокировать</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = { padding: '10px', textAlign: 'left', border: '1px solid #ddd' };
const td = { padding: '10px', border: '1px solid #ddd' };
