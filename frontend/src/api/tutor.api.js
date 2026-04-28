// src/api/tutor.api.js
import api from './client';

/** Hijos del tutor autenticado */
export const getMisHijos      = ()           => api.get('/tutor/mis-hijos');
/** Horario semanal del alumno */
export const getHorarioHijo   = (idAlumno)   => api.get(`/tutor/horario/${idAlumno}`);
/** Boleta: calificaciones + faltas por periodo */
export const getBoletaHijo    = (idAlumno)   => api.get(`/tutor/boleta/${idAlumno}`);
/** Historial de reportes de conducta */
export const getReportesHijo  = (idAlumno)   => api.get(`/tutor/reportes/${idAlumno}`);
/** Avisos del tutor */
export const getAvisos        = ()           => api.get('/tutor/avisos');
