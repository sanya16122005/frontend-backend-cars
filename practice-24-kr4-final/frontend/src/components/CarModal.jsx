import { useState, useEffect } from 'react';

const empty = { brand: '', model: '', year: 2024, price: 0, vin: '' };

export default function CarModal({ open, car, onClose, onSave }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(car ? { ...empty, ...car } : empty);
      setError('');
    }
  }, [open, car]);

  if (!open) return null;

  function update(field, value) { setForm(f => ({ ...f, [field]: value })); }

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await onSave({
        brand: form.brand.trim(),
        model: form.model.trim(),
        year:  Number(form.year),
        price: Number(form.price),
        vin:   form.vin?.trim() || null
      });
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Ошибка');
    }
  }

  return (
    <div className="modal" onClick={onClose}>
      <form className="modal__box" onClick={e => e.stopPropagation()} onSubmit={submit}>
        <h2>{car ? 'Изменить авто' : 'Добавить авто'}</h2>

        <div className="field">
          <label className="field__label">Производитель</label>
          <input className="input" value={form.brand} onChange={e => update('brand', e.target.value)} required />
        </div>
        <div className="field">
          <label className="field__label">Модель</label>
          <input className="input" value={form.model} onChange={e => update('model', e.target.value)} required />
        </div>
        <div className="field">
          <label className="field__label">Год выпуска</label>
          <input className="input" type="number" min="1900" max="2100" value={form.year} onChange={e => update('year', e.target.value)} required />
        </div>
        <div className="field">
          <label className="field__label">Цена, ₽</label>
          <input className="input" type="number" min="0" value={form.price} onChange={e => update('price', e.target.value)} required />
        </div>
        <div className="field">
          <label className="field__label">VIN (опционально)</label>
          <input className="input" maxLength="17" value={form.vin || ''} onChange={e => update('vin', e.target.value)} />
        </div>

        {error && <div className="error" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.45)', color: '#fca5a5', padding: 10, borderRadius: 10, fontSize: 13 }}>{error}</div>}

        <div className="modal__actions">
          <button type="button" className="btn" onClick={onClose}>Отмена</button>
          <button type="submit" className="btn btn--primary">{car ? 'Сохранить' : 'Создать'}</button>
        </div>
      </form>
    </div>
  );
}
