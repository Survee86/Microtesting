import { client } from './db_mng.js'; // Импортируем клиент из основного файла


/* ИСПОЛЬЗОВАНИЕ В ДРУГИХ ФАЙЛАХ

        import { checkMongoConnection } from './mng_check.js';

        // Использование
        const isConnected = await checkMongoConnection();
        if (!isConnected) {
          // Действия при отсутствии подключения
        } 
  
*/



/**
 * Проверяет подключение к MongoDB
 * @returns {Promise<boolean>} Возвращает true если подключение активно
 */
export async function checkMongoConnection() {
  try {
    if (!client.topology?.isConnected()) {
      await client.connect();
    }
    
    // Проверяем подключение через ping
    await client.db().admin().command({ ping: 1 });
    console.log('✅ MongoDB server is available');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection check failed:', error.message);
    return false;
  }
}