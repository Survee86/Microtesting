import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET не установлен в переменных окружения');
}

export const generateTokens = (payload) => {
  if (!payload || !payload.userId) {
    throw new Error('Неверный payload для генерации токена');
  }

  try {
    const accessToken = jwt.sign(
      { userId: payload.userId }, 
      JWT_SECRET, 
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
    
    return { accessToken };
  } catch (error) {
    console.error('Ошибка генерации токена:', error);
    throw error;
  }
};