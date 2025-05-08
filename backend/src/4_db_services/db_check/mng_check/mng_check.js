import { client }            from '../../db_config/db_mng.js'; // Импортируем клиент из основного файла
import { survee_connection } from '../../db_config/db_mng.js';

/* ИСПОЛЬЗОВАНИЕ В ДРУГИХ ФАЙЛАХ

        import { checkMongoConnection } from './mng_check.js';

        // Использование
        const isConnected = await checkMongoConnection();
        if (!isConnected) {
          // Действия при отсутствии подключения
        } 
  
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


export async function initializeMongoDB() {
  try {
    console.log('⌛ Attempting to connect to MongoDB...');
    
    // Проверяем подключение
    const isConnected = await checkMongoConnection();
    
    if (isConnected) {
      console.log('✅ MongoDB connection established successfully');
      
      // Дополнительно: проверяем подключение к конкретной базе (опционально)
      await survee_connection();
      console.log('✅ Survee database connection verified');
    } else {
      console.warn('⚠️ MongoDB connection check failed, but server is starting anyway');
    }
  } catch (error) {
    console.error('❌ Error during MongoDB initialization:', error.message);
    // Не прерываем запуск сервера, но логируем ошибку
  }
}