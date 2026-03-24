import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import CarModal from '../components/CarModal';

export default function CarsPage() {
  const [cars, setCars] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCar, setEditCar] = useState(null);
  const navigate = useNavigate();

  const loadCars = () => apiClient.get('/cars').then(r => setCars(r.data));

  useEffect(() => { loadCars(); }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const handleSave = async (data) => {
    if (editCar) {
      await apiClient.put(`/cars/${editCar.id}`, data);
    } else {
      await apiClient.post('/cars', data);
    }
    setModalOpen(false);
    setEditCar(null);
    loadCars();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить авто?')) return;
    await apiClient.delete(`/cars/${id}`);
    loadCars();
  };

  return (
    <div style={{ maxWidth: 900, margin: '20px auto', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>🚗 Каталог автомобилей</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => { setEditCar(null); setModalOpen(true); }}>+ Добавить</button>
          <button onClick={handleLogout}>Выйти</button>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={th}>Название</th>
            <th style={th}>Категория</th>
            <th style={th}>Цена</th>
            <th style={th}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {cars.map(car => (
            <tr key={car.id}>
              <td style={td}><Link to={`/cars/${car.id}`}>{car.title}</Link></td>
              <td style={td}>{car.category}</td>
              <td style={td}>{Number(car.price).toLocaleString()} ₽</td>
              <td style={td}>
                <button onClick={() => { setEditCar(car); setModalOpen(true); }}>✏️</button>
                {' '}
                <button onClick={() => handleDelete(car.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && <CarModal car={editCar} onSave={handleSave} onClose={() => { setModalOpen(false); setEditCar(null); }} />}
    </div>
  );
}

const th = { padding: '10px', textAlign: 'left', border: '1px solid #ddd' };
const td = { padding: '10px', border: '1px solid #ddd' };
