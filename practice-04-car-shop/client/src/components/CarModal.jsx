import React, { useEffect, useState } from 'react';

export default function CarModal({ open, mode, initialCar, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(initialCar?.name ?? '');
    setCategory(initialCar?.category ?? '');
    setDescription(initialCar?.description ?? '');
    setPrice(initialCar?.price != null ? String(initialCar.price) : '');
    setStock(initialCar?.stock != null ? String(initialCar.stock) : '');
  }, [open, initialCar]);

  if (!open) return null;

  const title = mode === 'edit' ? 'Редактировать автомобиль' : 'Добавить автомобиль';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) { alert('Введите название'); return; }
    if (!category.trim()) { alert('Введите категорию'); return; }
    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      alert('Введите корректную цену');
      return;
    }
    onSubmit({
      id: initialCar?.id,
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      price: parsedPrice,
      stock: Number(stock) || 0,
    });
  };

  return (
    <div className="backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal__header">
          <div className="modal__title">{title}</div>
          <button className="iconBtn" onClick={onClose} aria-label="Закрыть">✕</button>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <label className="label">Название
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Например, Toyota Camry" autoFocus />
          </label>
          <label className="label">Категория
            <input className="input" value={category} onChange={e => setCategory(e.target.value)} placeholder="Например, Седан" />
          </label>
          <label className="label">Описание
            <input className="input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Краткое описание" />
          </label>
          <label className="label">Цена (₽)
            <input className="input" value={price} onChange={e => setPrice(e.target.value)} placeholder="Например, 2500000" inputMode="numeric" />
          </label>
          <label className="label">На складе (шт.)
            <input className="input" value={stock} onChange={e => setStock(e.target.value)} placeholder="Например, 5" inputMode="numeric" />
          </label>
          <div className="modal__footer">
            <button type="button" className="btn" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn btn--primary">
              {mode === 'edit' ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
