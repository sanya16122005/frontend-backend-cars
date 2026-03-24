import { useState, useEffect } from 'react';

export default function CarModal({ car, onSave, onClose }) {
  const [form, setForm] = useState({ name: '', category: '', description: '', price: '', stock: '' });

  useEffect(() => {
    if (car) setForm({ name: car.name, category: car.category, description: car.description, price: car.price, stock: car.stock });
  }, [car]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, price: Number(form.price), stock: Number(form.stock) });
  };

  return (
    <div className="backdrop">
      <div className="modal">
        <div className="modal__header">
          <span className="modal__title">{car ? 'Редактировать' : 'Добавить автомобиль'}</span>
          <button className="iconBtn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="form">
          <label className="label">Название
            <input className="input" name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label className="label">Категория
            <input className="input" name="category" value={form.category} onChange={handleChange} required />
          </label>
          <label className="label">Описание
            <input className="input" name="description" value={form.description} onChange={handleChange} />
          </label>
          <label className="label">Цена
            <input className="input" name="price" value={form.price} onChange={handleChange} type="number" required />
          </label>
          <label className="label">На складе
            <input className="input" name="stock" value={form.stock} onChange={handleChange} type="number" />
          </label>
          <div className="modal__footer">
            <button type="button" className="btn" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn btn--primary">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
}
