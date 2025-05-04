import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { createUser, findUserByEmail } from '../models/user.js';
import { generateTokens } from '../utils/jwt.js';

// ФУНКЦИЯ РЕГИСТРАЦИИ ПОЛЬЗОВАТЕЛЯ

export const register = async (req, res) => {
  let user;
  try {
    const { email, password, name } = req.body;

    // Валидация входных данных
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Все поля обязательны для заполнения',
      });
    }

    // Проверка существования пользователя
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Пользователь с таким email уже существует',
      });
    }

    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Создание пользователя
    // В функции register
    user = await createUser({
      email,
      password: hashedPassword,
      name, // Убедитесь, что name передается
    });

    // Генерация токенов с автоматическим сроком действия (из jwt.js)
    let tokens;
    try {
      tokens = generateTokens({ userId: user.id });
    } catch (tokenError) {
      console.error('Ошибка генерации токена:', tokenError);
      // Откат создания пользователя при ошибке
      await pool.query('DELETE FROM users WHERE id = $1', [user.id]);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при создании сессии',
      });
    }

    // Успешный ответ с accessToken
    return res.status(201).json({
      success: true,
      message: 'Регистрация успешна',
      token: tokens.accessToken, // Теперь tokens содержит { accessToken }
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);

    // Откат при других ошибках
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Неверные учетные данные',
      });
    }

    // Проверка пароля
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Неверные учетные данные',
      });
    }

    // Генерация токенов с автоматическим сроком действия
    const tokens = generateTokens({ userId: user.id });

    return res.json({
      success: true,
      token: tokens.accessToken, // Теперь tokens содержит { accessToken }
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера',
    });
  }
};
