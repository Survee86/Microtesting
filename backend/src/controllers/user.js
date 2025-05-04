import { getUserById, updateUser } from '../models/user.js';

export const getCurrentUser = async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
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
        allowedFields
      });
    }

    const updatedUser = await updateUser(req.user.userId, updateData);
    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      message: 'Error updating user data',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};