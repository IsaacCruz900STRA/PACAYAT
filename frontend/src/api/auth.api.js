// src/api/auth.api.js
import api from './client';

export const getUsuariosPorRol = (rol) =>
  api.get(`/auth/usuarios-por-rol/${rol}`);

export const login = (username, password, rol) =>
  api.post('/auth/login', { username, password, rol });

export const logout = () =>
  api.post('/auth/logout');

export const sendRecoveryCode = (email) =>
  api.post('/auth/forgot-password', { email });

export const changePassword = (nuevaPassword) =>
  api.post('/auth/change-password', { nuevaPassword });

export const getMe = () =>
  api.get('/auth/me');
