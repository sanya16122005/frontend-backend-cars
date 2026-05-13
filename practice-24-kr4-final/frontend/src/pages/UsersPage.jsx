import { useEffect, useState } from 'react';
import api from '../api/client.js';

export default function UsersPage({ pushToast }) {
  const [users, setUsers]     = useState([]);
  const [meta, setMeta]       = useState({ source: '', server: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/users');
      setUsers(data.data);
      setMeta({ source: data.source, server: data.server });
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function changeRole(id, role) {
    await api.put(`/users/${id}`, { role });
    pushToast?.(`Роль обновлена: ${role}`);
    load();
  }

  async function toggleBlocked(u) {
    if (u.blocked) {
      await api.put(`/users/${u.id}`, { blocked: false });
      pushToast?.('Пользователь разблокирован');
    } else {
      if (!confirm(`Заблокировать ${u.email}?`)) return;
      await api.delete(`/users/${u.id}`);
      pushToast?.('Пользователь заблокирован');
    }
    load();
  }

  return (
    <>
      <div className="toolbar">
        <div className="toolbar__title">👥 Пользователи</div>
        <div className="toolbar__actions">
          {meta.source && (
            <span className={`toolbar__source ${meta.source}`}>
              {meta.source === 'cache' ? '⚡ Redis cache' : '🗄️ PostgreSQL'} · {meta.server}
            </span>
          )}
          <button className="btn" onClick={load}>↻ Обновить</button>
        </div>
      </div>

      {loading && <div className="loader">Загрузка…</div>}
      {error   && <div className="error" style={{ padding: 16, borderRadius: 12 }}>{error}</div>}

      {!loading && !error && (
        <table className="users-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Имя</th>
              <th>Фамилия</th>
              <th>Роль</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.first_name}</td>
                <td>{u.last_name}</td>
                <td>
                  <select className="select" value={u.role} onChange={e => changeRole(u.id, e.target.value)}>
                    <option value="user">user</option>
                    <option value="seller">seller</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>{u.blocked ? <span className="blocked">🚫 заблокирован</span> : '✅ активен'}</td>
                <td>
                  <button className={u.blocked ? 'btn btn--success' : 'btn btn--danger'} onClick={() => toggleBlocked(u)}>
                    {u.blocked ? 'Разблокировать' : 'Заблокировать'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
