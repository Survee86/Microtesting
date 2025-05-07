import { mng_connection } from '../db_config/db_mng.js';
import { pg_connection } from '../db_config/db_pg.js';
import { v4 as uuidv4 } from 'uuid';

export const createUser = async (userData) => {
  // Принимаем объект userData
  const { email, password, name } = userData; // Деструктурируем параметры
  const guid = uuidv4();
  const client = await pg_connection.connect();

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
    // 1. Поиск в PostgreSQL (теперь включаем password_hash в запрос)
    const pgResult = await pool.query(
      'SELECT id, guid, email, password_hash FROM users WHERE email = $1',
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
      password_hash: pgResult.rows[0].password_hash, // Явно добавляем password_hash
    };
  } catch (error) {
    console.error('Error in findUserByEmail:', error);
    throw error;
  }
};

export const getUserById = async (id) => {
  // Проверяем подключение к MongoDB
  if (!mongoose.connection?.db) {
    throw new Error('MongoDB connection is not established');
  }

  // 1. Получаем базовые данные из PostgreSQL
  const pgResult = await pool.query(
    `SELECT id, email, guid FROM users WHERE id = $1`,
    [id]
  );

  if (!pgResult.rows.length) return null;

  // 2. MongoDB данные (с обработкой ошибок)
  try {
    const mongoUser = await mongoose.connection.db
      .collection('users')
      .findOne({ postgresId: id });

    return {
      ...pgResult.rows[0],
      name: mongoUser?.name || '',
    };
  } catch (mongoError) {
    console.error('MongoDB query failed:', mongoError);
    return { ...pgResult.rows[0], name: '' }; // Возвращаем хотя бы PostgreSQL данные
  }
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
