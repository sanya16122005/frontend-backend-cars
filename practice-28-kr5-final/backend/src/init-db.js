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

CREATE TABLE IF NOT EXISTS tasks (
  id             SERIAL PRIMARY KEY,
  title          VARCHAR(120)  NOT NULL,
  description    TEXT,
  status         VARCHAR(20)   NOT NULL CHECK (status IN ('todo', 'in-progress', 'done')) DEFAULT 'todo',
  car_model      VARCHAR(80)   NOT NULL,
  price_estimate NUMERIC(12,2) NOT NULL CHECK (price_estimate >= 0),
  assignee_id    VARCHAR(40)   REFERENCES users(id) ON DELETE SET NULL,
  reminder_time  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ   DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
`;

async function seedUsersAndTasks() {
  // Check if users exist
  const { rows: uRows } = await pool.query('SELECT COUNT(*)::int AS n FROM users');
  if (uRows[0].n > 0) return;

  const adminId = nanoid();
  const mechanicId = nanoid();
  const driverId = nanoid();

  const adminHash = await bcrypt.hash('admin123', 10);
  const mechanicHash = await bcrypt.hash('mechanic123', 10);
  const driverHash = await bcrypt.hash('driver123', 10);

  // Seed Users
  await pool.query(
    `INSERT INTO users (id, email, first_name, last_name, password_hash, role) VALUES 
     ($1, 'admin@cars.local', 'Александр', 'Админ', $2, 'admin'),
     ($3, 'mechanic@cars.local', 'Сергей', 'Механик', $4, 'seller'),
     ($5, 'driver@cars.local', 'Дмитрий', 'Водитель', $6, 'user')`,
    [adminId, adminHash, mechanicId, mechanicHash, driverId, driverHash]
  );
  console.log('👤 Пользователи засеяны: admin@cars.local, mechanic@cars.local, driver@cars.local');

  // Seed Tasks
  const SEED_TASKS = [
    ['Замена моторного масла и фильтра', 'Плановое ТО, замена масла 5W-30 и масляного фильтра двигателя.', 'todo', 'BMW X5', 8500, mechanicId],
    ['Диагностика тормозной системы', 'Проверка износа колодок и дисков, замер уровня тормозной жидкости.', 'in-progress', 'Toyota Camry', 3200, mechanicId],
    ['Ремонт подвески', 'Замена сайлентблоков передних рычагов и регулировка схода-развала.', 'done', 'Hyundai Solaris', 14500, driverId],
    ['Замена свечей зажигания', 'Установка новых иридиевых свечей зажигания Bosch.', 'todo', 'Kia Sportage', 5000, null],
    ['Балансировка колес', 'Шиномонтаж и балансировка комплекта зимних шин R17.', 'in-progress', 'Lada Vesta', 2200, null]
  ];

  for (const t of SEED_TASKS) {
    await pool.query(
      `INSERT INTO tasks (title, description, status, car_model, price_estimate, assignee_id) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      t
    );
  }
  console.log(`🚗 Засеяно ${SEED_TASKS.length} Kanban-задач автосервиса`);
}

(async () => {
  try {
    await pool.query(SQL);
    console.log('✅ Таблицы users и tasks готовы');
    await seedUsersAndTasks();
  } catch (e) {
    console.error('❌ init-db error:', e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();

