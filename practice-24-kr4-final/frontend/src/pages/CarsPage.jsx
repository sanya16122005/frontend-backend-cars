import { useEffect, useState } from 'react';
import api from '../api/client.js';
import CarItem from '../components/CarItem.jsx';
import CarModal from '../components/CarModal.jsx';

export default function CarsPage({ role, pushToast }) {
  const [cars, setCars]       = useState([]);
  const [meta, setMeta]       = useState({ source: '', server: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [modal, setModal]     = useState({ open: false, car: null });

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/cars');
      setCars(data.data);
      setMeta({ source: data.source, server: data.server });
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function saveCar(payload) {
    if (modal.car) {
      const { data } = await api.patch(`/cars/${modal.car.id}`, payload);
      pushToast?.(`✏️ Обновлено: ${data.brand} ${data.model}`);
    } else {
      const { data } = await api.post('/cars', payload);
      pushToast?.(`➕ Добавлено: ${data.brand} ${data.model}`);
    }
    setModal({ open: false, car: null });
    load();
  }

  async function deleteCar(id) {
    if (!confirm('Удалить автомобиль?')) return;
    await api.delete(`/cars/${id}`);
    pushToast?.(`🗑️ Удалено #${id}`);
    load();
  }

  return (
    <>
      <div className="toolbar">
        <div className="toolbar__title">🚗 Каталог автомобилей</div>
        <div className="toolbar__actions">
          {meta.source && (
            <span className={`toolbar__source ${meta.source}`}>
              {meta.source === 'cache' ? '⚡ Redis cache' : '🗄️ PostgreSQL'} · {meta.server}
            </span>
          )}
          <button className="btn" onClick={load}>↻ Обновить</button>
          {['seller', 'admin'].includes(role) && (
            <button className="btn btn--primary" onClick={() => setModal({ open: true, car: null })}>
              + Добавить авто
            </button>
          )}
        </div>
      </div>

      {loading && <div className="loader">Загрузка…</div>}
      {error   && <div className="error" style={{ padding: 16, borderRadius: 12 }}>{error}</div>}

      {!loading && !error && (
        cars.length === 0
          ? <div className="empty">В каталоге пока нет автомобилей</div>
          : (
            <div className="cars-grid">
              {cars.map(car => (
                <CarItem
                  key={car.id}
                  car={car}
                  role={role}
                  onEdit={(c) => setModal({ open: true, car: c })}
                  onDelete={deleteCar}
                />
              ))}
            </div>
          )
      )}

      <CarModal
        open={modal.open}
        car={modal.car}
        onClose={() => setModal({ open: false, car: null })}
        onSave={saveCar}
      />
    </>
  );
}
