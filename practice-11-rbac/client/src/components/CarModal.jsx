import { useState, useEffect } from 'react';

export default function CarModal({ car, onSave, onClose }) {
  const [form, setForm] = useState({ title: '', category: '', description: '', price: '' });

  useEffect(() => {
    if (car) setForm({ title: car.title, category: car.category, description: car.description, price: car.price });
  }, [car]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, price: Number(form.price) });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: 30, borderRadius: 8, width: 400 }}>
        <h3>{car ? 'Редактировать авто' : 'Добавить авто'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input name="title"       value={form.title}       onChange={handleChange} placeholder="Название"   required />
          <input name="category"    value={form.category}    onChange={handleChange} placeholder="Категория"          />
          <input name="description" value={form.description} onChange={handleChange} placeholder="Описание"           />
          <input name="price"       value={form.price}       onChange={handleChange} placeholder="Цена"       type="number" required />
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit">Сохранить</button>
            <button type="button" onClick={onClose}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
}
