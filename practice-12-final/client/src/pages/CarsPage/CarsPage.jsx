import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import CarsList from '../../components/CarsList';
import CarModal from '../../components/CarModal';
import './CarsPage.scss';

function getUserRole() {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  return JSON.parse(atob(token.split('.')[1])).role;
}

export default function CarsPage() {
  const [cars, setCars] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCar, setEditCar] = useState(null);
  const navigate = useNavigate();
  const role = getUserRole();

  const loadCars = () => apiClient.get('/cars').then(r => setCars(r.data));
  useEffect(() => { loadCars(); }, []);

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const handleSave = async (data) => {
    if (editCar) {
      await apiClient.patch(`/cars/${editCar.id}`, data);
    } else {
      await apiClient.post('/cars', data);
    }
    setModalOpen(false);
    setEditCar(null);
    loadCars();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить автомобиль?')) return;
    await apiClient.delete(`/cars/${id}`);
    loadCars();
  };

  const handleEdit = (car) => { setEditCar(car); setModalOpen(true); };

  return (
    <div className="page">
      <header className="header">
        <div className="header__inner">
          <span className="brand">🚗 Автомобили</span>
          <span className="header__right">Роль: {role}</span>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="toolbar">
            <h2 className="title">Каталог</h2>
            <div style={{ display: 'flex', gap: 10 }}>
              {['seller', 'admin'].includes(role) && (
                <button className="btn btn--primary" onClick={() => { setEditCar(null); setModalOpen(true); }}>
                  + Добавить
                </button>
              )}
              {role === 'admin' && (
                <button className="btn btn--primary" onClick={() => navigate('/users')}>
                  👥 Пользователи
                </button>
              )}
              <a href="http://localhost:3000/api-docs" target="_blank" rel="noreferrer" className="btn">
                Swagger
              </a>
              <button className="btn btn--danger" onClick={handleLogout}>Выйти</button>
            </div>
          </div>

          <CarsList cars={cars} role={role} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      </main>

      <footer className="footer">
        <div className="footer__inner">Cars App © 2026</div>
      </footer>

      {modalOpen && (
        <CarModal
          car={editCar}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditCar(null); }}
        />
      )}
    </div>
  );
}
