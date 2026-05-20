// src/api/avisos.api.js
import api from './client';

export const getAvisos    = (tipo)    => api.get('/avisos', { params: { tipo } });
export const createAviso  = (data)    => api.post('/avisos', data);
export const updateAviso  = (id,data) => api.put(`/avisos/${id}`, data);
export const deleteAviso  = (id)      => api.delete(`/avisos/${id}`);

/** Sube un archivo adjunto al aviso. Devuelve { nombre, ruta, tamanio, mimetype } */
export const uploadAvisoDoc = (file) => {
  const fd = new FormData();
  fd.append('file', file);
  return api.post('/avisos/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

/** Construye la URL descargable de un documento de aviso */
export const getAvisoDocUrl = (ruta) => {
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '');
  return `${base}${ruta}`;
};
