import { checkMongoConnection } from '../4_db_services/db_check/mng_check/mng_check.js'


export async function mongoHealthMiddleware(req, res, next) {
  try {
    // Проверяем подключение к MongoDB
    const isConnected = await checkMongoConnection();
    
    if (!isConnected) {
      // Если нет подключения - возвращаем ошибку 503 (Service Unavailable)
      return res.status(503).json({
        status: 'error',
        message: 'MNG - middleware - База данных временно недоступна',
        timestamp: new Date().toISOString()
      });
    }
    
    // Если подключение есть - добавляем флаг в объект запроса
    req.mongoHealthy = true;
    next();
  } 
  
  catch (error) {
    // В случае непредвиденной ошибки возвращаем 500
    console.error('MNG - middleware - MongoDB health check failed:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'MNG - middleware - Internal server error during database health check',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
