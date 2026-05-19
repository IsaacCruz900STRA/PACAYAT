import api from './client';

// ── Importación PDF ───────────────────────────────────────────────────────────

/**
 * Sube un PDF de aSc Horarios y devuelve el horario parseado por grupo.
 * @param {File} file
 * @param {function} onProgress  callback (percent: number) => void
 */
export const importarPDF = (file, onProgress) => {
  const form = new FormData();
  form.append('pdf', file);
  return api.post('/horarios/importar-pdf', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: e => onProgress?.(Math.round((e.loaded * 100) / e.total)),
  });
};

/**
 * Guarda el horario editado después de importar el PDF.
 * @param {object} body  { grupos, idPeriodoEscolar?, limpiarGrupos? }
 */
export const guardarImportados = (body) =>
  api.post('/horarios/guardar-importados', body);

// ── Consultas ────────────────────────────────────────────────────────────────

/** Horario del docente autenticado */
export const getMiHorario = () =>
  api.get('/horarios/mi-horario');

/** Horario de un grupo por su ID */
export const getHorarioGrupo = (idGrupo) =>
  api.get('/horarios', { params: { idGrupo } });

/** Horario de un docente por su ID de Personal */
export const getHorarioDocente = (idDocente) =>
  api.get('/horarios', { params: { idDocente } });

/** Horario de un alumno (el backend busca su grupo automáticamente) */
export const getHorarioAlumno = (alumnoId) =>
  api.get(`/horarios/alumno/${alumnoId}`);

// ── Generador CP-SAT ─────────────────────────────────────────────────────────

/**
 * Genera un horario usando el solver OR-Tools CP-SAT.
 * @param {object} body
 *   - mockData: object        → datos de prueba (no guarda en BD)
 *   - aulas: array            → lista de aulas para generación real
 *   - restricciones: object   → { permitir_clases_dobles: boolean }
 *   - guardar: boolean        → guardar resultado en BD
 *   - limpiarAnterior: boolean
 */
export const generarHorario = (body) =>
  api.post('/horarios/generar', body);

/**
 * Guarda un horario editado manualmente (drag & drop) en la BD.
 */
export const guardarHorarioManual = (body) =>
  api.post('/horarios/guardar', body);

/**
 * Guarda el horario vinculado a un ID_GRUPO y CICLO_ESCOLAR específico.
 * @param {object} body  { assignments, idGrupo?, idPeriodoEscolar, limpiarAnterior? }
 */
export const guardarPorCiclo = (body) =>
  api.post('/horarios/guardar-ciclo', body);

/**
 * Grid 5×6 para un alumno dado su ID.
 * @param {number} alumnoId
 * @param {number?} idPeriodoEscolar  — opcional, usa periodo activo si se omite
 */
export const getHorarioAlumnoGrid = (alumnoId, idPeriodoEscolar) =>
  api.get(`/horarios/alumno-grid/${alumnoId}`, {
    params: idPeriodoEscolar ? { idPeriodoEscolar } : {},
  });

/**
 * Grid 5×6 para un docente dado su ID de Personal.
 */
export const getHorarioDocenteGrid = (personalId, idPeriodoEscolar) =>
  api.get(`/horarios/docente-grid/${personalId}`, {
    params: idPeriodoEscolar ? { idPeriodoEscolar } : {},
  });

/**
 * Agenda del docente autenticado (grid 9 bloques).
 */
export const getMiAgenda = (idPeriodoEscolar) =>
  api.get('/horarios/mi-agenda', {
    params: idPeriodoEscolar ? { idPeriodoEscolar } : {},
  });

/**
 * Resumen del módulo: tieneHorario, grupos/docentes con horario, warnings.
 */
export const getResumenHorarios = () =>
  api.get('/horarios/resumen');

// ── Helper: convertir respuesta API → grid visual ────────────────────────────

const DIA_LABEL = {
  LUNES:    'Lunes',
  MARTES:   'Martes',
  MIERCOLES:'Miércoles',
  JUEVES:   'Jueves',
  VIERNES:  'Viernes',
};

/**
 * Convierte array de horarios de la API al formato grid que usan los componentes:
 *   { Lunes: { 1: { mat, grupo, docente, salon } }, ... }
 */
export function toGrid(horarios = []) {
  const grid = {};
  for (const h of horarios) {
    const dia = DIA_LABEL[h.dia] || h.dia;
    if (!grid[dia]) grid[dia] = {};
    grid[dia][h.numeroClase] = {
      mat:     h.asignacion?.materia?.nombre || '—',
      grupo:   h.asignacion?.grupo?.nombre   || null,
      docente: h.asignacion?.docente?.nombre || null,
      salon:   h.salon || '—',
    };
  }
  return grid;
}

/**
 * Mapeo canónico hora → número de bloque (9 bloques, receso 9:30-10:00).
 * Usado por cualquier componente que convierta salida del solver al grid visual.
 */
export const HORA_A_SLOT = {
  '07:00-07:50': 1,
  '07:50-08:40': 2,
  '08:40-09:30': 3,
  '10:00-10:50': 4,
  '10:50-11:40': 5,
  '11:40-12:30': 6,
  '12:30-13:20': 7,
  '13:20-14:10': 8,
  '14:10-15:00': 9,
};

/**
 * Convierte la salida del solver a formato grid visual.
 * Enriquece con nombres si se pasa el contexto (mockData o ctx).
 */
export function solverToGrid(solverHorario = [], ctx = null) {
  const grid = {};
  for (const h of solverHorario) {
    const dia = h.dia;
    if (!grid[dia]) grid[dia] = {};
    const gObj = ctx?.grupos?.find(g => g.id === h.grupo_id);
    const pObj = ctx?.profesores?.find(p => p.id === h.profesor_id);
    grid[dia][HORA_A_SLOT[h.hora] || 1] = {
      materia: h.materia,
      grupo:   gObj?.nombre || h.grupo_id,
      docente: pObj?.nombre || h.profesor_id,
      salon:   h.aula_nombre,
    };
  }
  return grid;
}
