const { Pool } = require('pg');

const pool = new Pool({
  user:     process.env.PGUSER     || 'postgres',
  host:     process.env.PGHOST     || 'localhost',
  database: process.env.PGDATABASE || 'cars_db',
  password: process.env.PGPASSWORD || 'postgres',
  port:     Number(process.env.PGPORT) || 5432
});

pool.on('error', (err) => console.error('Postgres pool error:', err.message));

module.exports = { pool };
