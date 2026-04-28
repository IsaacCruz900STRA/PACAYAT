// src/api/alumnos.api.js
import api from './client';

export const getAlumnos      = (params) => api.get('/alumnos', { params });
export const getAlumno       = (id)     => api.get(`/alumnos/${id}`);
export const validarMatricula = (matricula, excludeId) => api.get('/alumnos/validar-matricula', { params: { matricula, excludeId } });
export const buscarAlumnos   = (q)      => api.get('/alumnos/buscar', { params: { q } });
export const createAlumno    = (data)   => api.post('/alumnos', data);
export const updateAlumno    = (id, data) => api.put(`/alumnos/${id}`, data);
export const deleteAlumno    = (id)     => api.delete(`/alumnos/${id}`);
