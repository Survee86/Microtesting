import { pool } from '../config/db.js';

export const createUser = async ({ email, password, firstName, lastName, birthDate }) => {
  const result = await pool.query(
    `INSERT INTO users 
     (email, password_hash, first_name, last_name, birth_date) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING id, email, first_name as "firstName", last_name as "lastName", birth_date as "birthDate"`,
    [email, password, firstName, lastName, birthDate]
  );
  return result.rows[0];
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

export const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};