import { pool } from '../config/db_pg.js';
import mongoose from 'mongoose'; // Явный импорт mongoose
import { v4 as uuidv4 } from 'uuid';

export const createUser = async (userData) => {
  // Принимаем объект userData
  const { email, password, name } = userData; // Деструктурируем параметры
  const guid = uuidv4();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Вставка в PostgreSQL
    const result = await client.query(
      `INSERT INTO users (guid, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, guid, email`,
      [guid, email, password]
    );

    const user = result.rows[0];

    // Проверяем подключение MongoDB
    if (!mongoose.connection.readyState) {
      throw new Error('MongoDB connection is not established');
    }

    // Вставка в MongoDB
    console.log('Inserting to MongoDB:', {
      guid: user.guid,
      postgresId: user.id,
      email: user.email,
      name: name,
      createdAt: new Date(),
    });

    // Принудительное создание коллекции
    await mongoose.connection.db.createCollection('users');
    console.log('Collection "users" created');

    const insertResult = await mongoose.connection.db
      .collection('users')
      .insertOne({
        guid: user.guid,
        postgresId: user.id,
        email: user.email,
        name: name,
        createdAt: new Date(),
      });

    console.log('Insert result:', insertResult);

    await client.query('COMMIT');

    return {
      ...user,
      name, // Добавляем name к возвращаемому объекту
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in createUser:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const findUserByEmail = async (email) => {
  try {
    // 1. Поиск в PostgreSQL
    const pgResult = await pool.query(
      'SELECT id, guid, email FROM users WHERE email = $1',
      [email]
    );

    if (!pgResult.rows.length) return null;

    // 2. Поиск в MongoDB
    const mongoUser = await mongoose.connection.db
      .collection('users')
      .findOne({ email });

    if (!mongoUser) {
      console.error('User exists in PostgreSQL but not in MongoDB');
      return null;
    }

    // 3. Объединение результатов
    return {
      ...pgResult.rows[0],
      name: mongoUser.name,
    };
  } catch (error) {
    console.error('Error in findUserByEmail:', error);
    throw error;
  }
};

export const getUserById = async (id) => {
  const result = await pool.query(
    `SELECT id, email, first_name as "firstName", last_name as "lastName", birth_date as "birthDate" 
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

export const updateUser = async (id, fields) => {
  const keys = Object.keys(fields);
  const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');

  const result = await pool.query(
    `UPDATE users SET ${setClause} 
     WHERE id = $1 
     RETURNING id, email, first_name as "firstName", last_name as "lastName", birth_date as "birthDate"`,
    [id, ...Object.values(fields)]
  );
  return result.rows[0];
};
