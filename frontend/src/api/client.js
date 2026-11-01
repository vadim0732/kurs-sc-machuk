import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Vite-прокси перенаправит это на Django
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик: перед каждым запросом добавляем JWT-токен, если он есть
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;