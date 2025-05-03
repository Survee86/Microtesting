import { authApi } from './api';

export const login = async (credentials) => {
  const response = await authApi.post('/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await authApi.post('/register', userData);
  return response.data;
};

export const getCurrentUser = async (token) => {
  const response = await authApi.get('/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};