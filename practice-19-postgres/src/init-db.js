const { pool } = require('./db');

const SQL = `
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

(async () => {
  try {
    await pool.query(SQL);
    console.log('✅ Таблица cars готова');
  } catch (e) {
    console.error('❌ Ошибка init-db:', e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
