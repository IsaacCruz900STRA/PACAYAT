const express   = require('express');
const router    = express.Router();
const auth      = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');
const ctrl      = require('../controllers/calificacionController');

// Grupos del docente autenticado
router.get('/mis-grupos', auth, roleGuard(['DOCENTE']), ctrl.getMisGrupos);

// Alumnos + calificaciones de un grupo/periodo (docente y control escolar)
router.get('/grupo', auth, roleGuard(['ADMIN', 'DOCENTE', 'CONTROL_ESCOLAR']), ctrl.getCalificacionesGrupo);

// Calificaciones de un alumno (para ExpedienteAlumno — admin)
router.get('/', auth, roleGuard(['ADMIN', 'DOCENTE', 'CONTROL_ESCOLAR', 'TUTOR', 'DIRECTIVO']), ctrl.getCalificaciones);

// Upsert individual (admin/secretaria/control_escolar)
router.post('/', auth, roleGuard(['ADMIN', 'SECRETARIA', 'CONTROL_ESCOLAR']), ctrl.upsertCalificacion);

// Guardar en bloque (docente y admin)
router.post('/masivo', auth, roleGuard(['ADMIN', 'DOCENTE']), ctrl.guardarCalificacionesMasivo);

module.exports = router;
