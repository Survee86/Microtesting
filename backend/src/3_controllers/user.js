import { getUserById } from '../4_db_services/models/user.js';
import { client as mongoClient } from '../4_db_services/db_config/db_mng.js';


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
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCurrentUser = async (req, res) => {
  try {

  } catch (error) {

  }
};
