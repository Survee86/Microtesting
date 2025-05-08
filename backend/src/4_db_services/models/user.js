import { client as mongoClient } from '../db_config/db_mng.js';
import { pg_connection } from '../db_config/db_pg.js';
import { v4 as uuidv4 } from 'uuid';

export const createUser = async (userData) => {
  const { email, password, name } = userData;
  const guid = uuidv4();
  const pgClient = await pg_connection.connect();
  
  try {
    await pgClient.query('BEGIN');

    // 1. Вставка в PostgreSQL
    const pgResult = await pgClient.query(
      `INSERT INTO users (guid, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, guid, email, created_at`,
      [guid, email, password]
    );

    const user = pgResult.rows[0];

    // 2. Подготовка данных для MongoDB
    const mongoUser = {
      guid: user.guid,
      postgresId: user.id,
      email: user.email,
      name: name,
      createdAt: user.created_at, // Используем timestamp из PostgreSQL
      updatedAt: new Date()
    };

    // 3. Вставка в MongoDB
    const mongoDb = mongoClient.db('survee');
    
    // Проверяем существование коллекции
    const collections = await mongoDb.listCollections({ name: 'users' }).toArray();
    if (collections.length === 0) {
      await mongoDb.createCollection('users');
      await mongoDb.collection('users').createIndexes([
        { key: { guid: 1 }, unique: true },
        { key: { email: 1 }, unique: true }
      ]);
    }

    await mongoDb.collection('users').insertOne(mongoUser);

    await pgClient.query('COMMIT');

    return {
      id: user.id,
      guid: user.guid,
      email: user.email,
      name: name,
      createdAt: user.created_at
    };

  } catch (error) {
    await pgClient.query('ROLLBACK');
    
    // Специальная обработка ошибки дубликата email
    if (error.code === '23505') { // PostgreSQL duplicate key
      error.statusCode = 409;
      error.message = 'Пользователь с таким email уже существует';
    } else if (error.code === 11000) { // MongoDB duplicate key
      error.statusCode = 409;
      error.message = 'Пользователь с таким email или GUID уже существует';
    }
    
    console.error('Error in createUser:', error);
    throw error;
  } finally {
    pgClient.release();
  }
};

export const findUserByEmail = async (email) => {
  const pgClient = await pg_connection.connect();
  try {
    // 1. Поиск в PostgreSQL
    const pgResult = await pgClient.query(
      'SELECT id, guid, email, password_hash, created_at FROM users WHERE email = $1',
      [email]
    );

    if (!pgResult.rows.length) return null;

    // 2. Поиск в MongoDB
    const mongoDb = mongoClient.db('survee');
    const mongoUser = await mongoDb.collection('users').findOne({ email });

    if (!mongoUser) {
      console.error('User exists in PostgreSQL but not in MongoDB');
      return null;
    }

    return {
      ...pgResult.rows[0],
      name: mongoUser.name,
      updatedAt: mongoUser.updatedAt
    };
  } catch (error) {
    console.error('Error in findUserByEmail:', error);
    throw error;
  } finally {
    pgClient.release();
  }
};

export const getUserById = async (id) => {
  const pgClient = await pg_connection.connect();
  try {
    // 1. Получаем базовые данные из PostgreSQL
    const pgResult = await pgClient.query(
      `SELECT id, guid, email, created_at FROM users WHERE id = $1`,
      [id]
    );

    if (!pgResult.rows.length) return null;

    // 2. Получаем данные из MongoDB
    const mongoDb = mongoClient.db('survee');
    const mongoUser = await mongoDb.collection('users').findOne({ postgresId: id });

    return {
      ...pgResult.rows[0],
      name: mongoUser?.name || null,
      updatedAt: mongoUser?.updatedAt || null
    };
  } catch (error) {
    console.error('Error in getUserById:', error);
    throw error;
  } finally {
    pgClient.release();
  }
};

export const updateUser = async (id, updateData) => {
  const { name, ...otherFields } = updateData;
  const pgClient = await pg_connection.connect();
  const mongoDb = mongoClient.db('survee');

  try {
    await pgClient.query('BEGIN');

    // 1. Обновляем MongoDB (данные профиля)
    if (name) {
      await mongoDb.collection('users').updateOne(
        { postgresId: id },
        { $set: { name, updatedAt: new Date() } }
      );
    }

    // 2. Обновляем PostgreSQL (если есть другие поля)
    if (Object.keys(otherFields).length > 0) {
      const setClause = Object.keys(otherFields)
        .map((key, i) => `${key} = $${i + 2}`)
        .join(', ');

      await pgClient.query(
        `UPDATE users SET ${setClause} WHERE id = $1`,
        [id, ...Object.values(otherFields)]
      );
    }

    await pgClient.query('COMMIT');
    return { success: true };
  } catch (error) {
    await pgClient.query('ROLLBACK');
    console.error('Error in updateUser:', error);
    throw error;
  } finally {
    pgClient.release();
  }
};