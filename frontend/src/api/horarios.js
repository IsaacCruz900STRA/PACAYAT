// src/api/horarios.api.js
import api from './client';

/** Devuelve el horario del docente autenticado */
export const getMiHorario = () =>
  api.get('/horarios/mi-horario');
