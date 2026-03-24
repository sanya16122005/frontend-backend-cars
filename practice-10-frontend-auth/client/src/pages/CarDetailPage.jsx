import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

export default function CarDetailPage() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.get(`/cars/${id}`).then(r => setCar(r.data)).catch(() => navigate('/cars'));
  }, [id, navigate]);

  if (!car) return <p>Загрузка...</p>;

  return (
    <div style={{ maxWidth: 500, margin: '60px auto', padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
      <button onClick={() => navigate('/cars')}>← Назад</button>
      <h2>{car.title}</h2>
      <p><b>Категория:</b> {car.category}</p>
      <p><b>Описание:</b> {car.description}</p>
      <p><b>Цена:</b> {Number(car.price).toLocaleString()} ₽</p>
    </div>
  );
}
