// src/routes/calificacionRoutes.js
const express   = require('express');
const router    = express.Router();
const auth      = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');
const ctrl      = require('../controllers/calificacionController');

// Grupos del docente autenticado
router.get('/mis-grupos', auth, roleGuard(['DOCENTE']), ctrl.getMisGrupos);

// Lista de alumnos con calificaciones de un grupo/periodo
router.get('/', auth, roleGuard(['ADMIN','DOCENTE','CONTROL_ESCOLAR','TUTOR']), ctrl.getCalificacionesGrupo);

// Guardar calificaciones (DOCENTE solo en periodo activo, ADMIN siempre)
router.post('/masivo', auth, roleGuard(['ADMIN','DOCENTE']), ctrl.guardarCalificacionesMasivo);

module.exports = router;
