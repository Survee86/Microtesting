import mongoose from 'mongoose';

export const checkMongo = async (req, res, next) => {
    try {
        // Если нет подключения, пытаемся переподключиться
        if (mongoose.connection.readyState !== 1) {
          await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000 // Таймаут 5 секунд
          });
        }
        
        // Проверяем после попытки подключения
        if (mongoose.connection.readyState === 1) {
          return next();
        }
        
        throw new Error('Не удалось установить подключение к базе данных');
        
      } catch (error) {
        console.error('Ошибка подключения к MongoDB:', error);
        
        res.status(503).json({
          success: false,
          message: 'Сервис временно недоступен. Проблемы с подключением к базе данных',
          error: error.message
        });
      }
    };