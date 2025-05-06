import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '1h'; // Установите срок действия

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET не задан в .env файле');
}

/**
 * Генерация access токена
 * @param {Object} payload - Данные для включения в токен (например, userId)
 * @returns {String} JWT токен
 */
export const generateTokens = (payload) => {
  const accessToken = jwt.sign(
    payload,
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
  return { accessToken };
};

/**
 * Верифицирует JWT access token
 * @param {string} token - JWT токен для верификации
 * @returns {Promise<object|false>} Декодированные данные токена или false при ошибке
 * @throws {Error} Пробрасывает оригинальную ошибку jwt.verify для точной обработки в middleware
 */
export const verifyAccessToken = async (token) => {
  // 1. Проверяем наличие токена
  if (!token || typeof token !== 'string') {
    console.error('Ошибка верификации: токен не предоставлен или не строка');
    return false;
  }

  try {
    // 2. Верифицируем токен с использованием секретного ключа
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      {
        algorithms: ['HS256'], // Явно указываем алгоритм для безопасности
        ignoreExpiration: false // Не игнорируем срок действия
      }
    );
    
    // 3. Логируем успешную верификацию (только в development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Токен успешно верифицирован для пользователя ID:', decoded.userId);
    }
    
    return decoded;
    
  } catch (err) {
    // 4. Детально логируем ошибки верификации
    switch (err.name) {
      case 'TokenExpiredError':
        console.error('Ошибка верификации: токен просрочен', {
          expiredAt: err.expiredAt,
          currentTime: new Date()
        });
        break;
        
      case 'JsonWebTokenError':
        console.error('Ошибка верификации: недействительный токен', {
          message: err.message,
          token: token.slice(0, 10) + '...' // Логируем часть токена для отладки
        });
        break;
        
      default:
        console.error('Неизвестная ошибка верификации токена:', {
          name: err.name,
          message: err.message,
          stack: err.stack
        });
    }
    
    // 5. Пробрасываем ошибку для обработки в middleware
    throw err;
  }
};

// Пример использования (можно удалить в продакшене):
// const token = generateAccessToken({ userId: 123 });
// console.log('Сгенерированный токен:', token);
// console.log('Проверка токена:', verifyToken(token));