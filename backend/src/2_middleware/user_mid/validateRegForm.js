import { findUserByEmail } from '../../4_db_services/models/user.js';

export const validateRegForm = async (req, res, next) => {
  try {
    const { email, password, firstName } = req.body;

    // 1. Проверка наличия всех полей
    if (!email || !password || !firstName) {
      return res.status(400).json({
        success: false,
        message: 'Все поля обязательны для заполнения',
      });
    }

    // 2. Валидация email (базовая проверка)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Некорректный формат email',
      });
    }

    // 3. Проверка длины пароля
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Пароль должен содержать минимум 6 символов',
      });
    }

    // 4. Проверка существования пользователя
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Пользователь с таким email уже существует',
      });
    }

    // Если все проверки пройдены, переходим к следующему middleware/контроллеру
    next();
  } catch (error) {
    console.error('Ошибка валидации формы:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка при валидации данных',
    });
  }
};