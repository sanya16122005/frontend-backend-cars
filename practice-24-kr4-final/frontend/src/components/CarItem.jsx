export default function CarItem({ car, role, onEdit, onDelete }) {
  return (
    <article className="car-card">
      <div className="car-card__title">{car.brand} {car.model}</div>
      <div className="car-card__row"><span>Год</span><span>{car.year}</span></div>
      {car.vin && <div className="car-card__row"><span>VIN</span><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{car.vin}</span></div>}
      <div className="car-card__price">{Number(car.price).toLocaleString('ru-RU')} ₽</div>

      {(['seller', 'admin'].includes(role) || role === 'admin') && (
        <div className="car-card__actions">
          {['seller', 'admin'].includes(role) && (
            <button className="btn btn--ghost" onClick={() => onEdit(car)}>✏️ Изменить</button>
          )}
          {role === 'admin' && (
            <button className="btn btn--danger" onClick={() => onDelete(car.id)}>🗑️ Удалить</button>
          )}
        </div>
      )}
    </article>
  );
}
