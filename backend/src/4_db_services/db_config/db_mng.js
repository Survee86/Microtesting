import { MongoClient } from 'mongodb';      // Импорт класса MongoClient из библиотеки mongodb для работы с MongoDB
import dotenv from 'dotenv';                // Импорт пакета dotenv для загрузки переменных окружения из файла .env


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

// Объявляем переменные для хранения:
let survee_db;               // подключения к конкретной БД
let usersCollection;  // коллекции пользователей
let profilesCollection;  // коллекции профилей (задач)

// Экспортируемая асинхронная функция для подключения к БД
export async function mng_connection() {
  // Если подключение уже установлено, возвращаем существующие ссылки
  if (survee_db) return { survee_db, usersCollection, tasksCollection };
  
  try {
    // Устанавливаем подключение к серверу MongoDB
    await client.connect();
    
    // Получаем ссылку на конкретную базу данных 'survee'
    survee_db = client.db('survee');
    
    // Получаем ссылки на коллекции:
    usersCollection     = survee_db.collection('users');       // коллекция пользователей
    profilesCollection  = survee_db.collection('profiles');    // коллекция профилей
    
    // Сообщение об успешном подключении (для дебага)
    console.log('Successfully connected to MongoDB');
    
    // Возвращаем объект с ссылками на БД и коллекции
    return { survee_db, usersCollection, profilesCollection };
  } catch (error) {
    // В случае ошибки выводим ее в консоль и завершаем процесс
    console.error('Connection to MongoDB failed:', error);
    process.exit(1);
  }
}

export { survee_db, usersCollection, profilesCollection };

// Пример использования в другом файле:
// import { connectToDatabase } from './your-file';
// const { survee_db, usersCollection, tasksCollection } = await connectToDatabase();