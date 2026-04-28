// src/api/calificaciones.api.js
import api from './client';

/** Lista de grupos asignados al docente en el periodo activo */
export const getMisGrupos = () =>
  api.get('/calificaciones/mis-grupos');

/** Alumnos + calificaciones de un grupo/materia/periodo */
export const getCalificacionesGrupo = (idAsignacion, idPeriodo) =>
  api.get('/calificaciones', { params: { idAsignacion, idPeriodo } });

/** Guarda (crea o actualiza) calificaciones en bloque */
export const guardarCalificaciones = (registros) =>
  api.post('/calificaciones/masivo', registros);

/** Periodo activo */
export const getPeriodoActivo = () =>
  api.get('/periodos/activo');

/** Todos los periodos del ciclo */
export const getPeriodos = () =>
  api.get('/periodos');
