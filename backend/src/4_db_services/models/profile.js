import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: { 
    type: Number, 
    required: true,
    index: true // Добавляем индекс для ускорения поиска
  },
  firstName: {
    type: String,
    trim: true // Автоматическое удаление пробелов по краям
  },
  lastName: {
    type: String,
    trim: true
  },
  birthDate: Date,
  contacts: {
    phone: {
      type: String,
      trim: true
    },
    telegram: {
      type: String,
      trim: true
    }
  },
  settings: {
    theme: { 
      type: String, 
      default: 'light',
      enum: ['light', 'dark'] // Гарантируем корректные значения
    },
    notifications: {
      type: Boolean,
      default: true // Значение по умолчанию
    }
  }
}, { 
  timestamps: true,
  collection: 'profiles' // Явное указание имени коллекции
});

// Безопасный экспорт модели (предотвращает повторное объявление)
const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);

export default Profile;