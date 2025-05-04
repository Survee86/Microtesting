import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firstName: String,
  lastName: String,
  birthDate: Date,
  contacts: {
    phone: String,
    telegram: String
  },
  settings: {
    theme: { type: String, default: 'light' },
    notifications: Boolean
  }
}, { timestamps: true });

export default mongoose.model('Profile', profileSchema);