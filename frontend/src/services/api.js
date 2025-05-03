import axios from 'axios';

export const authApi = axios.create({
  baseURL: 'http://localhost:3001/api',
});

export const storageApi = axios.create({
  baseURL: 'http://localhost:3002/api',
});

export const dataApi = axios.create({
  baseURL: 'http://localhost:3003/api',
});