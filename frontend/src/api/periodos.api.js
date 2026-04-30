// src/api/periodos.api.js
import api from './client';

export const getPeriodoActivo           = ()      => api.get('/periodos/activo');
export const getPeriodoEvaluacionActivo = ()      => api.get('/periodos/evaluacion-activo');
export const getPeriodos       = ()      => api.get('/periodos');
export const createPeriodo     = (data)  => api.post('/periodos', data);
export const updatePeriodo     = (id,d)  => api.put(`/periodos/${id}`, d);
