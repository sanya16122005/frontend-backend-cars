import React from 'react';
import CarItem from './CarItem';

export default function CarsList({ cars, onEdit, onDelete }) {
  if (!cars.length) {
    return <div className="empty">Автомобилей пока нет</div>;
  }
  return (
    <div className="list">
      {cars.map(car => (
        <CarItem key={car.id} car={car} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
