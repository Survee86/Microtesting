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
 * Верификация токена
 * @param {String} token - JWT токен
 * @returns {Object|Boolean} Декодированные данные или false при ошибке
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.error('JWT verification error:', err.message);
    return null;
  }
};

// Пример использования (можно удалить в продакшене):
// const token = generateAccessToken({ userId: 123 });
// console.log('Сгенерированный токен:', token);
// console.log('Проверка токена:', verifyToken(token));