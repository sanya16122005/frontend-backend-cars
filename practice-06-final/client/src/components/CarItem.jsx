import React from 'react';

export default function CarItem({ car, onEdit, onDelete }) {
  return (
    <div className="carRow">
      <div className="carMain">
        <div className="carName">{car.name}</div>
        <div className="carCategory">{car.category}</div>
        <div className="carDesc">{car.description}</div>
        <div className="carMeta">
          <span className="carPrice">{car.price.toLocaleString('ru-RU')} ₽</span>
          <span className="carStock">На складе: {car.stock} шт.</span>
        </div>
      </div>
      <div className="carActions">
        <button className="btn" onClick={() => onEdit(car)}>Изменить</button>
        <button className="btn btn--danger" onClick={() => onDelete(car.id)}>Удалить</button>
      </div>
    </div>
  );
}
