import { MongoClient }  from 'mongodb';      // Импорт класса MongoClient из библиотеки mongodb для работы с MongoDB
import dotenv           from 'dotenv';       // Импорт пакета dotenv для загрузки переменных окружения из файла .env


dotenv.config();                            // Загружаем переменные окружения из файла .env в process.env
const uri = process.env.MONGODB_URI;        // Получаем строку подключения к MongoDB из переменных окружения

// Проверяем, что строка подключения определена, иначе выбрасываем ошибку
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Создаем новый экземпляр MongoClient с указанием:
// - uri - строки подключения
// - объекта настроек, где:
//   - appName: имя приложения для мониторинга в MongoDB
//   - serverApi: настройки Stable API для совместимости версий
const client = new MongoClient(uri, { 
  appName: 'survee',
  serverApi: { version: '1', strict: true, deprecationErrors: true }
});

// Экспортируемая асинхронная функция для подключения к БД
export async function survee_connection() {

  try {
    // Подключаемся, если еще не подключены
    if  (!client.topology || !client.topology.isConnected()) 
        {await client.connect();}
    
    const survee_db           = client.db('survee');
    const usersCollection     = survee_db.collection('users');
    const profilesCollection  = survee_db.collection('profiles');
    
    console.log('MongoDB connection is active');
    
    return { survee_db, usersCollection, profilesCollection };
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error; // Пробрасываем ошибку для обработки на уровне выше
  }

}