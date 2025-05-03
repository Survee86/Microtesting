import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 20, // Максимальное количество соединений
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Проверка подключения
pool.query('SELECT NOW()', (err) => {
  if (err) console.error('Database connection error', err.stack);
  else console.log('Database connected successfully');
});