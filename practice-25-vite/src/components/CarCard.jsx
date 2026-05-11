export default function CarCard({ car }) {
  return (
    <article className="card">
      <h3 className="card__title">{car.brand} {car.model}</h3>
      <p className="card__year">Год: {car.year}</p>
      <p className="card__price">{car.price.toLocaleString('ru-RU')} ₽</p>
    </article>
  );
}
