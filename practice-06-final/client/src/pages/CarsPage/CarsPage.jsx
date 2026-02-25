import React, { useEffect, useState } from 'react';
import './CarsPage.scss';
import CarsList from '../../components/CarsList';
import CarModal from '../../components/CarModal';
import { api } from '../../api';

export default function CarsPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingCar, setEditingCar] = useState(null);

  useEffect(() => { loadCars(); }, []);

  const loadCars = async () => {
    try {
      setLoading(true);
      const data = await api.getCars();
      setCars(data);
    } catch (err) {
      console.error(err);
      alert('Ошибка загрузки автомобилей');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setModalMode('create'); setEditingCar(null); setModalOpen(true); };
  const openEdit = (car) => { setModalMode('edit'); setEditingCar(car); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingCar(null); };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить автомобиль?')) return;
    try {
      await api.deleteCar(id);
      setCars(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      alert('Ошибка удаления');
    }
  };

  const handleSubmitModal = async (payload) => {
    try {
      if (modalMode === 'create') {
        const newCar = await api.createCar(payload);
        setCars(prev => [...prev, newCar]);
      } else {
        const updated = await api.updateCar(payload.id, payload);
        setCars(prev => prev.map(c => c.id === payload.id ? updated : c));
      }
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Ошибка сохранения');
    }
  };

  return (
    <div className="page">
      <header className="header">
  <div className="header__inner">
    <div className="brand">🚗 Car Shop</div>
    <div className="header__right">
      <a
        href="http://localhost:3000/api-docs"
        target="_blank"
        rel="noreferrer"
        className="btn"
        style={{ fontSize: '13px' }}
      >
        📄 Swagger API
      </a>
    </div>
  </div>
</header>


      <main className="main">
        <div className="container">
          <div className="toolbar">
            <h1 className="title">Каталог автомобилей</h1>
            <button className="btn btn--primary" onClick={openCreate}>+ Добавить авто</button>
          </div>
          {loading
            ? <div className="empty">Загрузка...</div>
            : <CarsList cars={cars} onEdit={openEdit} onDelete={handleDelete} />
          }
        </div>
      </main>

      <footer className="footer">
        <div className="footer__inner">© {new Date().getFullYear()} Car Shop</div>
      </footer>

      <CarModal
        open={modalOpen}
        mode={modalMode}
        initialCar={editingCar}
        onClose={closeModal}
        onSubmit={handleSubmitModal}
      />
    </div>
  );
}
