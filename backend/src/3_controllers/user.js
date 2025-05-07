import { getUserById, updateUser } from '../4_db_services/models/user.js';
import Profile from '../4_db_services/models/profile.js'; // Добавьте в начало файла

export const getCurrentUser = async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);

    // Добавляем проверку на подключение MongoDB
    let profile = {};
    if (mongoose.connection.readyState === 1) {
      profile =
        (await Profile.findOne({ userId: req.user.userId }).lean()) || {};
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      name: user.name, // Из PostgreSQL/MongoDB users
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCurrentUser = async (req, res) => {
  try {
    // Проверяем, есть ли данные для обновления
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'No data provided for update' });
    }

    // Разрешенные поля для обновления
    const allowedFields = ['firstName', 'lastName', 'birthDate', 'email'];
    const updateData = {};

    // Фильтруем поля, которые можно обновлять
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Если после фильтрации не осталось полей
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: 'No valid fields provided for update',
        allowedFields,
      });
    }

    const updatedUser = await updateUser(req.user.userId, updateData);
    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      message: 'Error updating user data',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};
