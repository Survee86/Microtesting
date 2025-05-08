import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();
// Проверка обязательных переменных окружения
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'DB_PORT'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`❌ db_config/db_pg.js / Отсутствуют переменные подключения в файле .env: ${envVar}`);
  }
}

export const pg_connection = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT), // Явное преобразование в число
  max: 20,  // Максимальное количество клиентов в пуле
  min: 2,   // Рекомендуется указать минимальное количество
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Проверка подключения PostgreSQL
pg_connection.query('SELECT NOW()', (err) => {
  if (err)  console.error('❌ db_config/db_pg.js / PostgreSQL connection error', err.stack);
  else      console.log('✅ db_config/db_pg.js / PostgreSQL connected successfully');
});
