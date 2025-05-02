import axios from 'axios';
import api from './api';

const STORAGE_API_URL = process.env.REACT_APP_STORAGE_API_URL || 'http://localhost:4003';

/**
 * Сервис для работы с хранилищем файлов (MinIO)
 */
export const StorageService = {
  /**
   * Загружает аватар пользователя в MinIO
   * @param {string} userId - ID пользователя
   * @param {File} file - Файл аватарки
   * @returns {Promise<string>} URL загруженного файла
   */
  async uploadAvatar(userId, file) {
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('userId', userId);

    try {
      const response = await axios.post(`${STORAGE_API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.url;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw new Error('Failed to upload avatar');
    }
  },

  /**
   * Получает URL аватарки пользователя
   * @param {string} userId - ID пользователя
   * @returns {Promise<string|null>} URL аватарки или null если нет аватарки
   */
  async getAvatarUrl(userId) {
    try {
      const response = await api.get(`/storage/avatar/${userId}`);
      return response.data.url || null;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching avatar:', error);
      throw new Error('Failed to get avatar URL');
    }
  },

  /**
   * Удаляет аватарку пользователя
   * @param {string} userId - ID пользователя
   * @returns {Promise<void>}
   */
  async deleteAvatar(userId) {
    try {
      await api.delete(`/storage/avatar/${userId}`);
    } catch (error) {
      console.error('Error deleting avatar:', error);
      throw new Error('Failed to delete avatar');
    }
  }
};