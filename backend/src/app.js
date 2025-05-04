import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import profileRoutes from './routes/profile.js';
import { connectMongoDB } from './config/db.js'; // Импортируем функцию подключения

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Подключаем MongoDB перед запуском сервера
const startServer = async () => {
  try {
    await connectMongoDB(); // Явно вызываем подключение к MongoDB
    
    // Глобальная обработка CORS
    app.use((req, res, next) => {
      const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
      res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
      res.header('Access-Control-Allow-Methods', allowedMethods.join(','));
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Vary', 'Origin');
      
      if (req.method === 'OPTIONS') {
        return res.status(204).header('Content-Length', '0').end();
      }
      next();
    });

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Подключение роутов
    app.use('/api/auth', authRoutes);
    app.use('/api/user', userRoutes);
    app.use('/api/profile', profileRoutes);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1); // Завершаем процесс при ошибке
  }
};

startServer(); // Запускаем сервер