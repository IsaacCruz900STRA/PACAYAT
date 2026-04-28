import api from './client';

export const getCalificaciones = (params) => api.get('/calificaciones', { params });
