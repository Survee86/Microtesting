import api from './api';

export const ProfileService = {
  async getProfile(userId) {
    const response = await api.get(`/profile/${userId}`);
    return response.data;
  },

  async saveProfile(userId, profileData) {
    const response = await api.post('/profile', {
      userId,
      ...profileData
    });
    return response.data;
  },

  async updateAvatar(userId, avatarUrl) {
    const response = await api.patch(`/profile/${userId}/avatar`, { avatarUrl });
    return response.data;
  }
};