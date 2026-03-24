export default function CarItem({ car, role, onEdit, onDelete }) {
  return (
    <div className="carRow">
      <div className="carMain">
        <span className="carName">{car.name}</span>
        <span className="carCategory">{car.category}</span>
        <p className="carDesc">{car.description}</p>
        <div className="carMeta">
          <span className="carPrice">{Number(car.price).toLocaleString()} ₽</span>
          <span className="carStock">На складе: {car.stock} шт.</span>
        </div>
      </div>
      <div className="carActions">
        {['seller', 'admin'].includes(role) && (
          <button className="btn" onClick={() => onEdit(car)}>✏️ Изменить</button>
        )}
        {role === 'admin' && (
          <button className="btn btn--danger" onClick={() => onDelete(car.id)}>🗑️ Удалить</button>
        )}
      </div>
    </div>
  );
}
