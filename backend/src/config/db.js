import pg from 'pg';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Проверка подключения PostgreSQL
pool.query('SELECT NOW()', (err) => {
  if (err) console.error('PostgreSQL connection error', err.stack);
  else console.log('PostgreSQL connected successfully');
});

export const connectMongoDB = async () => {
  try {
    // Обновленный URL подключения с аутентификацией
    await mongoose.connect('mongodb://survee_admin:securepassword@localhost:27017/survee?authSource=survee', {
      serverSelectionTimeoutMS: 5000
    });
    
    // Проверка подключения
    await mongoose.connection.db.admin().ping();
    console.log('MongoDB connected successfully');
    
    // Обработчики событий
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to DB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });
    
    return mongoose.connection;
    
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

export const checkMongoConnection = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
};