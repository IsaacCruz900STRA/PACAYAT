// src/routes/prefectoRoutes.js
const express   = require('express');
const router    = express.Router();
const auth      = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');
const ctrl      = require('../controllers/prefectoController');

const ROLES_PERMITIDOS = ['ADMIN','PREFECTO','DIRECTIVO'];

router.get('/dashboard',              auth, roleGuard(ROLES_PERMITIDOS), ctrl.getDashboard);
router.get('/buscar',                 auth, roleGuard(ROLES_PERMITIDOS), ctrl.buscar);
router.get('/horario/alumno/:idAlumno',  auth, roleGuard(ROLES_PERMITIDOS), ctrl.getHorarioAlumno);
router.get('/horario/docente/:idPersonal',auth, roleGuard(ROLES_PERMITIDOS), ctrl.getHorarioDocente);
router.get('/reportes/:idAlumno',     auth, roleGuard(ROLES_PERMITIDOS), ctrl.getReportesAlumno);

module.exports = router;
