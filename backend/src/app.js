import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import profileRoutes from './routes/profile.js';
import { connectToDatabase } from './config/db_mng.js';
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use (cors   ({
                      origin: 'http://localhost:5173', // Укажите здесь адрес вашего фронтенда
                      credentials: true, // Если вы используете куки или аутентификацию
                      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Разрешенные методы
                      allowedHeaders: ['Content-Type', 'Authorization'] // Разрешенные заголовки
                })
        )


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

// Добавьте в app.js для проверки
app.get("/test-db", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// Запуск приложения

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});