// src/api/client.js — Cliente axios centralizado PACAYAT
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: true, // enviar cookie httpOnly en cada request
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/logout');

      localStorage.removeItem('pacayat_user');

      if (!isAuthRequest) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
