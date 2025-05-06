import bcrypt from 'bcryptjs';
import { pool } from '../config/db_pg.js';
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




/* 
    Рекомендации для дальнейшей разработки:
    
    1. Добавьте валидацию пароля при регистрации
          Минимальная длина (например, 8 символов)
          Обязательное наличие цифр и спецсимволов
    2. Улучшите обработку ошибок
          Более информативные сообщения для пользователя (например, "Неверный email или пароль" вместо "Ошибка сервера")
          Логирование ошибок в файл для отладки
    3. Защитите API от брутфорса
          Ограничьте количество попыток входа (например, 5 попыток за 5 минут)
          Используйте express-rate-limit
    4. Добавьте JWT-проверку в защищённые роуты
          Создайте middleware для проверки токена
*/



export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email); // Логирование
    
    const user = await findUserByEmail(email);
    console.log('Found user:', user); // Логирование найденного пользователя

    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({
        success: false,
        message: 'Неверные учетные данные',
      });
    }

    if (!user.password_hash) {
      console.error('Password hash missing for user:', user.id);
      return res.status(500).json({
        success: false,
        message: 'Ошибка сервера: отсутствует хеш пароля',
      });
    }

    console.log('Comparing password with hash:', user.password_hash);
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      console.log('Password mismatch for user:', user.id);
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
