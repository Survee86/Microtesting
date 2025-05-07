import express  from 'express';
import dotenv   from 'dotenv';

/* import authRoutes     from './routes/auth.js';
import userRoutes     from './routes/user.js';
import profileRoutes  from './routes/profile.js'; */

import cors from "cors";
import { survee_connection } from './4_db_services/db_config/db_mng.js';
import { pg_connection     } from './4_db_services/db_config/db_pg.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use (cors   ({
                      origin: 'http://localhost:5173', // Укажите здесь адрес вашего фронтенда
                      credentials: true, // Если вы используете куки или аутентификацию
                      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Разрешенные методы
                      allowedHeaders: ['Content-Type', 'Authorization'] // Разрешенные заголовки
                })
        )

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Подключение роутов

/* app.use('/api/auth',    authRoutes);
app.use('/api/user',    userRoutes);
app.use('/api/profile', profileRoutes); */

// Функция для проверки подключений
async function checkDatabaseConnections() {
  try {
    // Проверка MongoDB
    try {
      const { survee_db } = await survee_connection();
      await survee_db.command({ ping: 1 });
      console.log('app.js / checkDatabaseConnections() - MongoDB connection check: OK');
    } catch (mongoError) {
      console.error('app.js / checkDatabaseConnections() - ошибка проверки подключения к MongoDB:', mongoError.message);
    }

    // Проверка PostgreSQL
    try {
      const client = await pg_connection.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('app.js / checkDatabaseConnections() - PostgreSQL connection check: OK');
    } catch (pgError) {
      console.error('app.js / checkDatabaseConnections() - PostgreSQL connection check failed:', pgError.message);
    }
  } catch (error) {
    console.error('app.js / checkDatabaseConnections() - ошибка в функции: ', error);
  }
}

// Запуск периодической проверки (каждые 5 минут)
function startDatabaseHealthChecks(intervalMinutes = 5) {
  const intervalMs = intervalMinutes * 60 * 1000;
  
  // Первая проверка сразу при старте
  checkDatabaseConnections();
  
  // Периодические проверки
  const intervalId = setInterval(checkDatabaseConnections, intervalMs);
  
  // Остановка проверки при завершении приложения
  process.on('SIGINT', () => {
    clearInterval(intervalId);
    process.exit(0);
  });
}

// Запуск периодических проверок
startDatabaseHealthChecks();



// Запуск приложения

app.listen(PORT, () => {
  console.log(`app.js - сервер запущен на порту - ${PORT}`);
});