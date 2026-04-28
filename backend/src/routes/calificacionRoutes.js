const express   = require('express');
const router    = express.Router();
const auth      = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');
const ctrl      = require('../controllers/calificacionController');

router.get('/', auth, ctrl.getCalificaciones);
router.post('/', auth, roleGuard(['ADMIN', 'DOCENTE', 'SECRETARIA', 'CONTROL_ESCOLAR']), ctrl.upsertCalificacion);
router.put('/:id', auth, roleGuard(['ADMIN', 'DOCENTE', 'SECRETARIA', 'CONTROL_ESCOLAR']), ctrl.updateCalificacion);

module.exports = router;
