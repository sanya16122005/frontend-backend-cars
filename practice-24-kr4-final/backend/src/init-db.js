const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');
const { pool } = require('./db');

const SQL = `
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(40)  PRIMARY KEY,
  email         VARCHAR(120) UNIQUE NOT NULL,
  first_name    VARCHAR(80)  NOT NULL,
  last_name     VARCHAR(80)  NOT NULL,
  password_hash VARCHAR(120) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'user',
  blocked       BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cars (
  id          SERIAL PRIMARY KEY,
  brand       VARCHAR(80)  NOT NULL,
  model       VARCHAR(120) NOT NULL,
  year        INTEGER      NOT NULL CHECK (year BETWEEN 1900 AND 2100),
  price       NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  vin         VARCHAR(17)  UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand);
CREATE INDEX IF NOT EXISTS idx_cars_year  ON cars(year);
`;

const SEED_CARS = [
  ['Toyota',  'Camry',    2022, 2500000, null],
  ['Kia',     'Sportage', 2021, 3000000, null],
  ['Lada',    'Vesta',    2023, 1200000, null],
  ['BMW',     'X5',       2023, 7500000, 'WBA12345678901234'],
  ['Hyundai', 'Solaris',  2020, 1600000, null]
];

async function seedAdminIfEmpty() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM users');
  if (rows[0].n > 0) return;
  const hash = await bcrypt.hash('admin123', 10);
  await pool.query(
    `INSERT INTO users (id, email, first_name, last_name, password_hash, role)
     VALUES ($1, $2, $3, $4, $5, 'admin')`,
    [nanoid(), 'admin@cars.local', 'Admin', 'Demo', hash]
  );
  console.log('👤 Создан admin: admin@cars.local / admin123');
}

async function seedCarsIfEmpty() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM cars');
  if (rows[0].n > 0) return;
  for (const c of SEED_CARS) {
    await pool.query(
      'INSERT INTO cars (brand, model, year, price, vin) VALUES ($1,$2,$3,$4,$5)',
      c
    );
  }
  console.log(`🚗 Засеяно ${SEED_CARS.length} автомобилей`);
}

(async () => {
  try {
    await pool.query(SQL);
    console.log('✅ Таблицы users и cars готовы');
    await seedAdminIfEmpty();
    await seedCarsIfEmpty();
  } catch (e) {
    console.error('❌ init-db error:', e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
