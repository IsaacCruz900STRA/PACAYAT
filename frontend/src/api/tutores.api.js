import api from './client';

export const getMisHijos  = ()         => api.get('/tutores/mis-hijos');
export const getTutores   = (params)   => api.get('/tutores', { params });
export const getTutor     = (id)       => api.get(`/tutores/${id}`);
export const updateTutor  = (id, data) => api.put(`/tutores/${id}`, data);
