import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail } from '../4_db_services/models/user.js';
import { generateTokens } from '../utils/jwt.js';

// ФУНКЦИЯ РЕГИСТРАЦИИ ПОЛЬЗОВАТЕЛЯ

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Параллельное выполнение хеширования и генерации соли
    const [salt, userExists] = await Promise.all([
      bcrypt.genSalt(10),
      findUserByEmail(email) // Дополнительная проверка для безопасности
    ]);

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Пользователь с таким email уже существует',
      });
    }

    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Создаем пользователя и генерируем токены в одной транзакции
    const result = await pg_connection.query('BEGIN');
    try {
      const user = await createUser({ email, password: hashedPassword, name });
      const tokens = generateTokens({ userId: user.id });
      
      await pg_connection.query('COMMIT');
      
      return res.status(201).json({
        success: true,
        message: 'Регистрация успешна',
        token: tokens.accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      await pg_connection.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    
    const errorMessage = error.code === '23505' // Код ошибки дубликата в PostgreSQL
      ? 'Пользователь с таким email уже существует'
      : 'Произошла ошибка при регистрации';

    return res.status(error.statusCode || 500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/* Рекомендации для дальнейшей разработки:
    
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
    5. Можно вынести генерацию токенов в отдельный сервис
    6. Для работы с транзакциями можно создать вспомогательную функцию-обертку
    7. Можно добавить кэширование результатов проверки существования пользователя
    8. Для хеширования пароля можно подобрать оптимальное количество раундов (10 - хорошее значение по умолчанию)          
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

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token отсутствует' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // Новый токен на 15 минут
    );

    res.json({
      token: newAccessToken,
      expiresIn: 15 * 60 * 1000, // Время жизни в миллисекундах
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Недействительный refresh token' });
  }
};
