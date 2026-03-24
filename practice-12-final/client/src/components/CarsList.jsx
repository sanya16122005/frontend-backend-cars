import CarItem from './CarItem';

export default function CarsList({ cars, role, onEdit, onDelete }) {
  if (!cars.length) return <p className="empty">Автомобилей нет</p>;
  return (
    <div className="list">
      {cars.map(car => (
        <CarItem key={car.id} car={car} role={role} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
