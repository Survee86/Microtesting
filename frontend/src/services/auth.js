import api from './api';

// Сервис для работы с аутентификацией
export const AuthService = {
  // Регистрация нового пользователя
  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Вход пользователя
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Получение текущего пользователя
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  }
};