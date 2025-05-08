/* 
=================================
ИМПОРТЫ
================================= 
*/

import express  from 'express';
import dotenv   from 'dotenv';
import { checkMongoConnection, initializeMongoDB } from './4_db_services/db_check/mng_check/mng_check.js';

 
import authRoutes     from './1_routes/auth.js'
import userRoutes     from './1_routes/user.js';
import profileRoutes  from './1_routes/profile.js';


import cors from "cors";


/* 
=================================
APP USE
================================= 
*/



dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use /* ПОдключение CORS */ 
        (cors   ({
                      origin: 'http://localhost:5173', // Укажите здесь адрес вашего фронтенда
                      credentials: true, // Если вы используете куки или аутентификацию
                      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Разрешенные методы
                      allowedHeaders: ['Content-Type', 'Authorization'] // Разрешенные заголовки
                }))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Подключение роутов


app.use('/api/auth',    authRoutes);
app.use('/api/user',    userRoutes);
app.use('/api/profile', profileRoutes); 


/* 
=================================
ЗАПУСК ПРИЛОЖЕНИЯ
================================= 
*/

// Запуск приложения
app.listen(PORT, async () => {
  console.log(`\n🚀 app.js - сервер запущен на порту - ${PORT}`);
  
  // Инициализируем подключение к MongoDB после старта сервера
  await initializeMongoDB();
  
  // Можно добавить дополнительную информацию о состоянии сервера
  console.log('\n🔹 Server status:');
  console.log(`- Express server: running on port ${PORT}`);
  console.log('- MongoDB status: checking...');
  
  // Дополнительная проверка через 2 секунды (опционально)
  setTimeout(async () => {
    const status = await checkMongoConnection();
    console.log(`- MongoDB connection: ${status ? '✅ active' : '❌ inactive'}`);
  }, 2000);
});