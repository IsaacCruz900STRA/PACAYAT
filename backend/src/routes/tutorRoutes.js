// src/routes/tutorRoutes.js
const express   = require('express');
const router    = express.Router();
const auth      = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');
const ctrl      = require('../controllers/tutorController');

// El tutor solo ve sus propios alumnos (verificación en controller)
router.get('/mis-hijos',        auth, roleGuard(['TUTOR']), ctrl.getMisHijos);
router.get('/horario/:idAlumno',auth, roleGuard(['TUTOR']), ctrl.getHorario);
router.get('/boleta/:idAlumno', auth, roleGuard(['TUTOR']), ctrl.getBoleta);
router.get('/reportes/:idAlumno',auth, roleGuard(['TUTOR']), ctrl.getReportes);
router.get('/avisos',           auth, roleGuard(['TUTOR']), ctrl.getAvisos);

module.exports = router;
