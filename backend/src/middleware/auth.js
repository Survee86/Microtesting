import { verifyAccessToken } from '../utils/jwt.js';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      message: 'Требуется авторизация' 
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(403).json({ 
      success: false,
      message: 'Недействительный или просроченный токен' 
    });
  }

  req.user = decoded;
  next();
};