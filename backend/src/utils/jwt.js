import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

export const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: ACCESS_TOKEN_EXPIRY 
  });
  
  const refreshToken = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: REFRESH_TOKEN_EXPIRY 
  });

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const refreshTokens = (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) return null;
  
  // Удаляем exp и iat из payload перед генерацией новых токенов
  const { exp, iat, ...payload } = decoded;
  
  return generateTokens(payload);
};

// Middleware для проверки access token
export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Токен не предоставлен' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(403).json({ message: 'Неверный или просроченный токен' });
  }

  req.user = decoded;
  next();
};