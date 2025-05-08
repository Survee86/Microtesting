import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();
const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

export const client = new MongoClient(uri, { 
  appName: 'multi-db-connector',
  serverApi: { version: '1', strict: true, deprecationErrors: true }
});

/** * Универсальная функция подключения к MongoDB
 
 * @param {string} dbName - Название базы данных
 * @param {string[]} collectionNames - Массив названий коллекций
 * @returns {Promise<{db: Db, collections: {[key: string]: Collection}}>}
 */

export async function mongo_connection(dbName, collectionNames = []) {
  try {
    if (!client.topology?.isConnected()) {
      await client.connect();
    }
    
    const db = client.db(dbName);
    const collections = {};
    
    for (const name of collectionNames) {
      collections[name] = db.collection(name);
    }
    
    console.log(`✅ MongoDB connection to database "${dbName}" is active`);
    
    return { db, collections };
  } catch (error) {
    console.error(`❌ MongoDB connection to "${dbName}" failed:`, error);
    throw error;
  }
}


// Специфичное подключение для базы survee (для обратной совместимости)
export async function survee_connection() {
  return mongo_connection('survee', ['users', 'profiles']);
}