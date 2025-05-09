import { getUserById } from '../4_db_services/models/user.js';
import { client as mongoClient } from '../4_db_services/db_config/db_mng.js';
import { updateUser } from '../4_db_services/models/user.js';



export const getCurrentUser = async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Получаем данные профиля из MongoDB
    const mongoDb = mongoClient.db('survee');
    const profile = await mongoDb.collection('users').findOne(
      { postgresId: Number(req.user.userId) },
      {
        projection: {
          firstName: 1,
          lastName: 1,
          birthDate: 1,
          name: 1,
          updatedAt: 1
        }
      }
    );

    res.json({
      id: user.id,
      email: user.email,
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      name: profile?.name || user.name,
      birthDate: profile?.birthDate || null
    });
    console.log(profile);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id; // Проверяем оба варианта
    const updateData = req.body;

    // Выполняем обновление
    const result = await updateUser(userId, updateData);

    return res.status(200).json({
      success: true,
      message: 'Данные пользователя успешно обновлены',
      updatedFields: Object.keys(updateData),
    });
  } catch (error) {
    console.error('Ошибка обновления пользователя:', error);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Произошла ошибка при обновлении данных';

    return res.status(statusCode).json({
      success: false,
      message: message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
