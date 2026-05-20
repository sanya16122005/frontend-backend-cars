import { useEffect, useState } from 'react';
import api from '../api/client.js';

export default function KanbanPage({ role, pushToast }) {
  const [tasks, setTasks]     = useState([]);
  const [users, setUsers]     = useState([]); // Для назначения исполнителя
  const [meta, setMeta]       = useState({ source: '', server: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [modal, setModal]     = useState({ open: false, task: null });
  const [search, setSearch]   = useState('');

  // Форма для создания/редактирования
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    car_model: '',
    price_estimate: '',
    assignee_id: '',
    reminder_time: ''
  });

  async function loadTasks() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/tasks');
      setTasks(data.data);
      setMeta({ source: data.source, server: data.server });
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    // Пользователей может загружать только admin
    if (role !== 'admin') return;
    try {
      const { data } = await api.get('/api/users');
      setUsers(data.data || []);
    } catch (e) {
      console.log('Пользователи не загружены (нет прав или оффлайн)');
    }
  }

  useEffect(() => {
    loadTasks();
    loadUsers();
  }, [role]);

  // Socket.IO синхронизация
  useEffect(() => {
    const handleCreated = (task) => {
      setTasks(prev => {
        if (prev.some(t => t.id === task.id)) return prev;
        return [...prev, task];
      });
    };

    const handleUpdated = (task) => {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    };

    const handleDeleted = (data) => {
      setTasks(prev => prev.filter(t => t.id !== data.id));
    };

    // Слушаем глобальный socket (если подключен в App.jsx)
    window.socket?.on('taskCreated', handleCreated);
    window.socket?.on('taskUpdated', handleUpdated);
    window.socket?.on('taskDeleted', handleDeleted);

    return () => {
      window.socket?.off('taskCreated', handleCreated);
      window.socket?.off('taskUpdated', handleUpdated);
      window.socket?.off('taskDeleted', handleDeleted);
    };
  }, []);

  const openCreateModal = () => {
    setForm({
      title: '',
      description: '',
      status: 'todo',
      car_model: '',
      price_estimate: '',
      assignee_id: '',
      reminder_time: ''
    });
    setModal({ open: true, task: null });
  };

  const openEditModal = (task) => {
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      car_model: task.car_model,
      price_estimate: task.price_estimate,
      assignee_id: task.assignee_id || '',
      reminder_time: task.reminder_time ? new Date(task.reminder_time).toISOString().substring(0, 16) : ''
    });
    setModal({ open: true, task });
  };

  const saveTask = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        price_estimate: Number(form.price_estimate),
        assignee_id: form.assignee_id || null,
        reminder_time: form.reminder_time || null
      };

      if (modal.task) {
        const { data } = await api.patch(`/api/tasks/${modal.task.id}`, payload);
        pushToast?.(`✏️ Задача обновлена: "${data.title}"`);
      } else {
        const { data } = await api.post('/api/tasks', payload);
        pushToast?.(`➕ Задача создана: "${data.title}"`);
      }
      setModal({ open: false, task: null });
      loadTasks();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const deleteTask = async (id) => {
    if (!confirm('Удалить эту задачу?')) return;
    try {
      await api.delete(`/api/tasks/${id}`);
      pushToast?.(`🗑️ Задача #${id} удалена`);
      loadTasks();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  // Drag and Drop
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = Number(e.dataTransfer.getData('text/plain'));
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === targetStatus) return;

    // Оптимистичное обновление UI
    const originalTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: targetStatus } : t));

    try {
      await api.patch(`/api/tasks/${taskId}`, { status: targetStatus });
      pushToast?.(`🔄 Задача "${task.title}" перенесена в "${targetStatus}"`);
    } catch (err) {
      // Откат при ошибке
      setTasks(originalTasks);
      alert(err.response?.data?.error || 'Ошибка при переносе задачи');
    }
  };

  // Фильтрация
  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.car_model.toLowerCase().includes(search.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
  );

  const columns = [
    { id: 'todo', title: '📥 К выполнению', color: '#818cf8' },
    { id: 'in-progress', title: '⚙️ В работе', color: '#fbbf24' },
    { id: 'done', title: '✅ Готово', color: '#34d399' }
  ];

  return (
    <div className="page">
      <div className="toolbar">
        <div className="toolbar__title">📋 Kanban-доска автосервиса</div>
        <div className="toolbar__actions">
          <input 
            type="text" 
            placeholder="Поиск по задачам..." 
            className="input" 
            style={{ width: '200px', padding: '6px 12px', fontSize: '13px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {meta.source && (
            <span className={`toolbar__source ${meta.source}`}>
              {meta.source === 'cache' ? '⚡ Redis cache' : '🗄️ PostgreSQL'} · {meta.server}
            </span>
          )}
          <button className="btn" onClick={loadTasks}>↻ Обновить</button>
          {['seller', 'admin'].includes(role) && (
            <button className="btn btn--primary" onClick={openCreateModal}>
              + Создать задачу
            </button>
          )}
        </div>
      </div>

      {loading && <div className="loader">Загрузка задач…</div>}
      {error && <div className="error" style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>{error}</div>}

      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '16px' }}>
          {columns.map(col => (
            <div 
              key={col.id} 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '16px',
                minHeight: '500px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: `2px solid ${col.color}`, paddingBottom: '8px', marginBottom: '8px' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: col.color }}></span>
                {col.title}
                <span style={{ marginLeft: 'auto', fontSize: '12px', background: 'rgba(255, 255, 255, 0.1)', padding: '2px 8px', borderRadius: '10px' }}>
                  {filteredTasks.filter(t => t.status === col.id).length}
                </span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1, overflowY: 'auto' }}>
                {filteredTasks.filter(t => t.status === col.id).map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      padding: '14px',
                      cursor: 'grab',
                      transition: 'transform 0.1s ease',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                    onDragOver={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                    onDragLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '6px' }}>{task.title}</div>
                    {task.description && (
                      <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', lineBreak: 'anywhere' }}>
                        {task.description.length > 80 ? task.description.substring(0, 80) + '...' : task.description}
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#9ca3af', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>🚗 Авто:</span>
                        <span style={{ color: '#fff', fontWeight: '500' }}>{task.car_model}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>💰 Стоимость:</span>
                        <span style={{ color: '#818cf8', fontWeight: '600' }}>{Number(task.price_estimate).toLocaleString('ru-RU')} ₽</span>
                      </div>
                      {task.assignee_first_name && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>👤 Исполнитель:</span>
                          <span style={{ color: '#34d399' }}>{task.assignee_first_name} {task.assignee_last_name[0]}.</span>
                        </div>
                      )}
                      {task.reminder_time && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fbbf24' }}>
                          <span>⏰ Напоминание:</span>
                          <span>{new Date(task.reminder_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px', justifyContent: 'flex-end' }}>
                      {['seller', 'admin'].includes(role) && (
                        <button className="btn" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => openEditModal(task)}>✏️</button>
                      )}
                      {role === 'admin' && (
                        <button className="btn btn--danger" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => deleteTask(task.id)}>🗑️</button>
                      )}
                    </div>
                  </div>
                ))}

                {filteredTasks.filter(t => t.status === col.id).length === 0 && (
                  <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px', padding: '32px 0', border: '1px dashed rgba(255, 255, 255, 0.05)', borderRadius: '10px' }}>
                    Нет задач
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно создания / редактирования */}
      {modal.open && (
        <div className="modal">
          <div className="modal__box" style={{ maxWidth: '500px' }}>
            <h2>{modal.task ? '✏️ Редактировать задачу' : '➕ Создать Kanban-задачу'}</h2>
            <form onSubmit={saveTask} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="field">
                <span className="field__label">Название задачи</span>
                <input 
                  type="text" 
                  required
                  placeholder="Например: Замена колодок" 
                  className="input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="field">
                <span className="field__label">Описание</span>
                <textarea 
                  placeholder="Опишите детали ремонта..." 
                  className="input"
                  style={{ height: '70px', resize: 'none' }}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="field">
                  <span className="field__label">Модель автомобиля</span>
                  <input 
                    type="text" 
                    required
                    placeholder="Например: Toyota Camry" 
                    className="input"
                    value={form.car_model}
                    onChange={(e) => setForm({ ...form, car_model: e.target.value })}
                  />
                </div>

                <div className="field">
                  <span className="field__label">Стоимость (₽)</span>
                  <input 
                    type="number" 
                    required
                    min="0"
                    placeholder="Например: 5000" 
                    className="input"
                    value={form.price_estimate}
                    onChange={(e) => setForm({ ...form, price_estimate: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="field">
                  <span className="field__label">Статус</span>
                  <select 
                    className="select"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="todo">📥 К выполнению</option>
                    <option value="in-progress">⚙️ В работе</option>
                    <option value="done">✅ Готово</option>
                  </select>
                </div>

                <div className="field">
                  <span className="field__label">Напомнить в</span>
                  <input 
                    type="datetime-local" 
                    className="input"
                    value={form.reminder_time}
                    onChange={(e) => setForm({ ...form, reminder_time: e.target.value })}
                  />
                </div>
              </div>

              {role === 'admin' && users.length > 0 && (
                <div className="field">
                  <span className="field__label">Назначить исполнителя</span>
                  <select 
                    className="select"
                    value={form.assignee_id}
                    onChange={(e) => setForm({ ...form, assignee_id: e.target.value })}
                  >
                    <option value="">Без исполнителя</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.first_name} {u.last_name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="modal__actions">
                <button type="button" className="btn btn--ghost" onClick={() => setModal({ open: false, task: null })}>Отмена</button>
                <button type="submit" className="btn btn--primary">Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
