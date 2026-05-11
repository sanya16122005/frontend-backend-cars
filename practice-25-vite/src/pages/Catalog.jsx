import { useState } from 'react';
import CarCard from '../components/CarCard.jsx';

const ALL_CARS = [
  { id: 1, brand: 'Toyota',  model: 'Camry',    year: 2022, price: 2500000 },
  { id: 2, brand: 'Kia',     model: 'Sportage', year: 2021, price: 3000000 },
  { id: 3, brand: 'Lada',    model: 'Vesta',    year: 2023, price: 1200000 },
  { id: 4, brand: 'BMW',     model: 'X5',       year: 2023, price: 7500000 },
  { id: 5, brand: 'Hyundai', model: 'Solaris',  year: 2020, price: 1600000 },
  { id: 6, brand: 'Audi',    model: 'A4',       year: 2022, price: 4200000 }
];

export default function Catalog() {
  const [filter, setFilter] = useState('');
  const cars = ALL_CARS.filter(c =>
    `${c.brand} ${c.model}`.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <section>
      <h2>Каталог автомобилей</h2>
      <input
        className="search"
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Поиск по бренду или модели…"
      />
      <div className="grid">
        {cars.map(c => <CarCard key={c.id} car={c} />)}
        {!cars.length && <p className="empty">Ничего не найдено</p>}
      </div>
    </section>
  );
}
