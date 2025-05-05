import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import profileRoutes from './routes/profile.js';
import { connectToDatabase } from './config/db_mng.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;




app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Подключение роутов
app.use('/api/auth',    authRoutes);
app.use('/api/user',    userRoutes);
app.use('/api/profile', profileRoutes);


// Подключение к MONGODB

async function main() {
  await connectToDatabase();
  // ваш остальной код
}

main().catch(console.error);




// Запуск приложения

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});