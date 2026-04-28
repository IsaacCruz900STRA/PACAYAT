const express    = require('express');
const router     = express.Router();
const auth       = require('../middlewares/auth');
const roleGuard  = require('../middlewares/roleGuard');
const ctrl       = require('../controllers/alumnoController');

// Buscador (para modal de reportes) — todos los roles autenticados
router.get('/buscar', auth, ctrl.buscarAlumnos);
router.get('/validar-matricula', auth, roleGuard(['ADMIN','SECRETARIA']), ctrl.validarMatricula);

// Listado y detalle
router.get('/',    auth, roleGuard(['ADMIN','DIRECTIVO','PREFECTO','SECRETARIA','CONTROL_ESCOLAR']), ctrl.getAlumnos);
router.get('/:id', auth, ctrl.getAlumno);

// Solo admin y secretaria pueden modificar
router.post('/',    auth, roleGuard(['ADMIN','SECRETARIA']), ctrl.createAlumno);
router.put('/:id',  auth, roleGuard(['ADMIN','SECRETARIA']), ctrl.updateAlumno);
router.delete('/:id', auth, roleGuard(['ADMIN','SECRETARIA']), ctrl.deleteAlumno);

module.exports = router;
