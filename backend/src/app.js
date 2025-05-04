import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import morgan from 'morgan';
import userRoutes from './routes/user.js';
import profileRoutes from './routes/profile.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(morgan('dev'));
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Добавьте эту строку

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/profile', profileRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});