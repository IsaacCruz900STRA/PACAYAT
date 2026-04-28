import api from './client';

/** Calificaciones de un alumno por idAlumno (para ExpedienteAlumno / admin) */
export const getCalificaciones = (params) => api.get('/calificaciones', { params });

/** Grupos y materias asignados al docente autenticado */
export const getMisGrupos = () => api.get('/calificaciones/mis-grupos');

/** Alumnos + calificaciones de un grupo/periodo */
export const getCalificacionesGrupo = (idAsignacion, idPeriodo) =>
  api.get('/calificaciones/grupo', { params: { idAsignacion, idPeriodo } });

/** Guarda (crea o actualiza) calificaciones en bloque */
export const guardarCalificaciones = (registros) =>
  api.post('/calificaciones/masivo', registros);

/** Periodo escolar activo */
export const getPeriodoActivo = () => api.get('/periodos/activo');

/** Todos los periodos de evaluación del ciclo */
export const getPeriodos = () => api.get('/periodos');
