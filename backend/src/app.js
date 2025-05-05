import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import profileRoutes from './routes/profile.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;


    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Подключение роутов
    app.use('/api/auth', authRoutes);
    app.use('/api/user', userRoutes);
    app.use('/api/profile', profileRoutes);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });