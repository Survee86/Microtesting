// Импортируем функцию verifyAccessToken из нашего модуля JWT
import { verifyAccessToken } from '../utils/jwt.js';

// Экспортируем middleware аутентификации
export const authenticate = async (req, res, next) => {
  // 1. Получаем заголовок авторизации из запроса
  const authHeader = req.headers.authorization;
  
  // 2. Проверяем наличие заголовка авторизации
  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      message: 'Требуется авторизация',
      code: 'AUTH_REQUIRED' // Уникальный код ошибки для клиента
    });
  }

  // 3. Извлекаем токен из заголовка (формат: "Bearer <token>")
  const tokenParts = authHeader.split(' ');
  
  // 4. Проверяем формат токена
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Неверный формат токена',
      code: 'INVALID_TOKEN_FORMAT'
    });
  }

  const token = tokenParts[1];

  try {
    // 5. Верифицируем токен
    const decoded = await verifyAccessToken(token);

    // 6. Проверяем результат верификации
    if (!decoded) {
      return res.status(403).json({ 
        success: false,
        message: 'Недействительный токен',
        code: 'INVALID_TOKEN'
      });
    }

    // 7. Добавляем декодированные данные пользователя в объект запроса
    req.user = decoded;
    
    // 8. Передаем управление следующему middleware/обработчику
    next();
  } catch (error) {
    // 9. Обрабатываем различные типы ошибок
    
    // Если токен просрочен
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: 'Токен просрочен',
        code: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt // Дополнительная информация для клиента
      });
    }
    
    // Если ошибка верификации
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Недействительный токен',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Все остальные ошибки
    console.error('Ошибка аутентификации:', error);
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера при аутентификации',
      code: 'AUTH_INTERNAL_ERROR'
    });
  }
};