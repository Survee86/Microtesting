/* ОПТИМИЗАЦИЯ

1. Нужно функции проверки коннекта к mongo вынести отсюда, т.к. есть существующая проверка:
        4_db_services
        ┣ db_check
        ┃ ┣ mng_check
        ┃ ┃ ┗ mng_check.js

2. Всю валидацию вынести в отдельный middleware
        2_middleware
          ┣ user_mid
          ┃ ┗ validateRegForm.js

*/

import { client as mongoClient } from '../db_config/db_mng.js';
import { pg_connection } from '../db_config/db_pg.js';
import { v4 as uuidv4 } from 'uuid';

// Валидация входных данных для создания пользователя
const validateUserData = (userData) => {
  if (!userData || typeof userData !== 'object') {
    throw new Error('Invalid user data: expected object');
  }

  const { email, password, firstName  } = userData;
  
  if (!email || typeof email !== 'string') {
    throw new Error('Invalid email: must be a non-empty string');
  }
  
  if (!password || typeof password !== 'string') {
    throw new Error('Invalid password: must be a non-empty string');
  }
  
  if (!firstName  || typeof firstName  !== 'string') {
    throw new Error('Invalid firstName : must be a non-empty string');
  }
};

export const createUser = async (userData) => {
  try {
    validateUserData(userData);
    
    const { email, password, firstName  } = userData;
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
        firstName: firstName,
        lastName: '',
        birthDate: null,
        createdAt: user.created_at,
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
          { key: { email: 1 }, unique: true },
          { key: { postgresId: 1 }, unique: true }
        ]);
      }

      await mongoDb.collection('users').insertOne(mongoUser);

      await pgClient.query('COMMIT');

      return {
        id: user.id,
        guid: user.guid,
        email: user.email,
        firstName : firstName,
        createdAt: user.created_at
      };

    } catch (error) {
      await pgClient.query('ROLLBACK');
      
      if (error.code === '23505') { // PostgreSQL duplicate key
        error.statusCode = 409;
        error.message = 'Пользователь с таким email уже существует';
      } else if (error.code === 11000) { // MongoDB duplicate key
        error.statusCode = 409;
        error.message = 'Пользователь с таким email или GUID уже существует';
      }
      
      throw error;
    } finally {
      pgClient.release();
    }
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
};

export const findUserByEmail = async (email) => {
  if (!email || typeof email !== 'string') {
    throw new Error('Invalid email: must be a non-empty string');
  }

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
      firstName: mongoUser.firstName || '',
      lastName: mongoUser.lastName || '',
      birthDate: mongoUser.birthDate || null,
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
  if (!id || isNaN(Number(id))) {
    throw new Error('Invalid user ID: must be a number');
  }

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
    const mongoUser = await mongoDb.collection('users').findOne(
      { postgresId: Number(id) },
      {
        projection: {
          firstName: 1,
          lastName: 1,
          birthDate: 1,
          updatedAt: 1
        }
      }
    );

    return {
      ...pgResult.rows[0],
      firstName: mongoUser?.firstName || '',
      lastName: mongoUser?.lastName || '',
      birthDate: mongoUser?.birthDate || null,
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
  if (!id || isNaN(Number(id))) {
    throw new Error('Invalid user ID: must be a number');
  }

  if (!updateData || typeof updateData !== 'object') {
    throw new Error('Invalid update data: expected object');
  }

  const pgClient = await pg_connection.connect();
  const mongoDb = mongoClient.db('survee');

  try {
    await pgClient.query('BEGIN');

    // 1. Подготовка обновлений
    const pgUpdates = {};
    const mongoUpdates = { 
      updatedAt: new Date(),
      ...(updateData.firstName && { firstName: updateData.firstName }),
      ...(updateData.lastName && { lastName: updateData.lastName }),
      ...(updateData.birthDate && { birthDate: new Date(updateData.birthDate) })
    };

    // Обработка email (если он есть в updateData)
    if (updateData.email) {
      pgUpdates.email = updateData.email;
      mongoUpdates.email = updateData.email;
    }

    // 2. Выполнение обновлений
    const updatePromises = [];
    
    // Обновление PostgreSQL (только если нужно обновить email)
    if (pgUpdates.email) {
      updatePromises.push(
        pgClient.query(
          'UPDATE users SET email = $1 WHERE id = $2',
          [pgUpdates.email, id]
        )
      );
    }

    // Обновление MongoDB (все профильные данные)
    updatePromises.push(
      mongoDb.collection('users').updateOne(
        { postgresId: Number(id) },
        { $set: mongoUpdates }
      )
    );

    await Promise.all(updatePromises);
    await pgClient.query('COMMIT');

    // 3. Получаем обновленные данные для возврата
    const updatedUser = await getUserById(id);

    return {
      success: true,
      user: updatedUser
    };

  } catch (error) {
    await pgClient.query('ROLLBACK');
    
    // Обработка ошибок дубликатов
    if (error.code === '23505') { // PostgreSQL duplicate email
      error.statusCode = 409;
      error.message = 'Пользователь с таким email уже существует';
    } else if (error.code === 11000) { // MongoDB duplicate
      error.statusCode = 409;
      error.message = 'Пользователь с таким email уже существует';
    }
    
    console.error('Error in updateUser:', error);
    throw error;
  } finally {
    pgClient.release();
  }
};