import { MongoClient } from 'mongodb';

// URL подключения к MongoDB (по умолчанию MongoDB в Docker слушает на 27017)
// Если MongoDB требует аутентификации, используйте формат:
// 'mongodb://username:password@localhost:27017/databaseName'
const url = 'mongodb://admin:admin@localhost:27017';
const dbName = 'survee';

let client;
let db;

export async function connectToDatabase() {
  try {
    
    client = new MongoClient(url);
    await client.connect();
    db = client.db(dbName);
    console.log('Successfully connected to MongoDB');
    
    // Получаем и выводим список всех баз данных и коллекций
    await listAllDatabasesAndCollections();
    
    return db;

  } catch (error) {
    
    console.error('Connection to MongoDB failed:', error);
    process.exit(1);

  }
}


async function listAllDatabasesAndCollections() {
  try {
    const adminDb = client.db().admin();
    const databasesList = await adminDb.listDatabases();
    
    console.log('\nAll databases and collections:');
    
    for (const dbInfo of databasesList.databases) {
      console.log(`\nDatabase: ${dbInfo.name}`);
      
      const currentDb = client.db(dbInfo.name);
      const collections = await currentDb.listCollections().toArray();
      
      if (collections.length > 0) {
        collections.forEach(collection => console.log(`  - ${collection.name}`));

        
        
        
        
        // Добавляем тестовый документ в базу survee, коллекцию users
        if (dbInfo.name === 'survee') {
          const usersCollection = currentDb.collection('users');
          
          // Проверяем, существует ли коллекция users
          const collectionExists = collections.some(coll => coll.name === 'users');
          
          if (collectionExists) {
            const testUser = {
              username: 'test_user',
              email: 'test@example.com',
              createdAt: new Date(),
              status: 'active',
              roles: ['user'],
              metadata: {
                lastLogin: null,
                loginCount: 0
              }
            };

            try {
              const result = await usersCollection.insertOne(testUser);
              console.log(`\nAdded test user to 'survee.users' with ID: ${result.insertedId}`);
            } catch (insertError) {
              console.error('\nError adding test user:', insertError.message);
            }
          } else {
            console.log('\nCollection "users" does not exist in "survee" database');
          }
        }






      } else {
        console.log('  (no collections)');
      }
    }
  } catch (err) {
    console.error('Error listing databases and collections:', err);
  }
}





export function getDb() {
  if (!db) throw new Error('Database not initialized');
  return db;
}

