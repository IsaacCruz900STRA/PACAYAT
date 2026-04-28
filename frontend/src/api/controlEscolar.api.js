// src/api/controlEscolar.api.js
import api from './client';

export const getDashboardStats    = ()           => api.get('/control-escolar/dashboard');
export const getGrupos            = (params)     => api.get('/control-escolar/grupos', { params });
export const getAsignaciones      = (params)     => api.get('/control-escolar/asignaciones', { params });
export const createAsignacion     = (data)       => api.post('/control-escolar/asignaciones', data);
export const updateAsignacion     = (id, data)   => api.put(`/control-escolar/asignaciones/${id}`, data);
export const deleteAsignacion     = (id)         => api.delete(`/control-escolar/asignaciones/${id}`);
export const getReportes          = (params)     => api.get('/control-escolar/reportes', { params });
export const getReportesAlumno    = (idAlumno)   => api.get(`/control-escolar/reportes/${idAlumno}`);
export const getPeriodos          = ()           => api.get('/control-escolar/periodos');
export const updatePeriodo        = (id, data)   => api.put(`/control-escolar/periodos/${id}`, data);
export const createPeriodo        = (data)       => api.post('/control-escolar/periodos', data);
