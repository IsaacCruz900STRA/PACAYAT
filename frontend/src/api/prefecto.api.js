// src/api/prefecto.api.js
import api from './client';

/** Busca alumnos O docentes según el tipo */
export const buscarPersonas = (q, tipo = 'alumno') =>
  api.get('/prefecto/buscar', { params: { q, tipo } });

/** Horario de un alumno (por idAlumno) */
export const getHorarioAlumno = (idAlumno) =>
  api.get(`/prefecto/horario/alumno/${idAlumno}`);

/** Horario de un docente (por idPersonal) */
export const getHorarioDocente = (idPersonal) =>
  api.get(`/prefecto/horario/docente/${idPersonal}`);

/** Reportes de un alumno */
export const getReportesAlumno = (idAlumno, tipo = '') =>
  api.get(`/prefecto/reportes/${idAlumno}`, { params: { tipo } });

/** Stats del dashboard */
export const getDashboardStats = () =>
  api.get('/prefecto/dashboard');
