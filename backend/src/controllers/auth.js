import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail } from '../models/user.js';
import { generateTokens } from '../utils/jwt.js';

export const register = async (req, res) => {
  let user;
  try {
    const { email, password, name } = req.body;
    
    // Валидация входных данных
    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false,
        message: 'Все поля обязательны для заполнения' 
      });
    }

    // Проверка существования пользователя
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Пользователь с таким email уже существует' 
      });
    }

    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Создание пользователя
    user = await createUser({
      email,
      password: hashedPassword,
      name
    });

    // Генерация токенов (обернуто в try-catch)
    let tokens;
    try {
      tokens = generateTokens({ userId: user.id });
    } catch (tokenError) {
      console.error('Ошибка генерации токена:', tokenError);
      // Удаляем пользователя, если не смогли сгенерировать токен
      await pool.query('DELETE FROM users WHERE id = $1', [user.id]);
      return res.status(500).json({ 
        success: false,
        message: 'Ошибка при создании сессии' 
      });
    }

    // Успешный ответ
    return res.status(201).json({ 
      success: true,
      message: 'Регистрация успешна',
      token: tokens.accessToken,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      } 
    });

  } catch (error) {
    console.error('Ошибка регистрации:', error);
    
    // Если пользователь был создан, но произошла другая ошибка
    if (user?.id) {
      try {
        await pool.query('DELETE FROM users WHERE id = $1', [user.id]);
      } catch (deleteError) {
        console.error('Ошибка при откате создания пользователя:', deleteError);
      }
    }
    
    return res.status(500).json({ 
      success: false,
      message: 'Произошла ошибка при регистрации',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Добавьте эту функцию, если её нет
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Неверные учетные данные' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Неверные учетные данные' 
      });
    }

    const tokens = generateTokens({ userId: user.id });

    return res.json({
      success: true,
      token: tokens.accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};