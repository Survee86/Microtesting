// Конфигурация axios

import axios from 'axios';

const API_URL = 'http://localhost:3001/api/auth'; // Замените на ваш бэкенд-URL

export const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});