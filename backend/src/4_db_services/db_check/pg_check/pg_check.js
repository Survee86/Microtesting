import { pg_connection } from '../db_config/db_pg.js';

export async function checkPgConnection() {
  let client;
  try {
    client = await pg_connection.connect();
    await client.query('SELECT NOW()');
    return {
      ok: true,
      message: 'PostgreSQL connection is healthy'
    };
  } catch (error) {
    return {
      ok: false,
      message: `PostgreSQL connection failed: ${error.message}`
    };
  } finally {
    if (client) client.release();
  }
}