import { findUserByEmail } from '../../4_db_services/models/user.js';

export const validateUpdateForm = async (req, res, next) => {
  try {
    const { email, firstName, lastName, birthDate } = req.body;
    const userId = req.user.id; // Предполагаем, что аутентификация уже пройдена

    // 1. Проверка на пустой запрос
    if (!email && !firstName && !lastName && !birthDate) {
      return res.status(400).json({
        success: false,
        message: 'Не указаны данные для обновления',
      });
    }

    // 2. Валидация email (если он есть в запросе)
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Некорректный формат email',
        });
      }

      // Проверка, что email не занят другим пользователем
      const existingUser = await findUserByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Пользователь с таким email уже существует',
        });
      }
    }

    // 3. Валидация имени (если оно есть в запросе)
    if (firstName && typeof firstName !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Имя должно быть строкой',
      });
    }

    // 4. Валидация фамилии (если она есть в запросе)
    if (lastName && typeof lastName !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Фамилия должна быть строкой',
      });
    }

    // 5. Валидация даты рождения (если она есть в запросе)
    if (birthDate && isNaN(Date.parse(birthDate))) {
      return res.status(400).json({
        success: false,
        message: 'Некорректный формат даты рождения',
      });
    }

    next();
  } catch (error) {
    console.error('Ошибка валидации формы обновления:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка при валидации данных',
    });
  }
};