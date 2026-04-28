const express   = require('express');
const router    = express.Router();
const auth      = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');
const ctrl      = require('../controllers/asistenciaController');

router.get('/', auth, ctrl.getAsistencia);
router.post('/', auth, roleGuard(['ADMIN', 'DOCENTE', 'PREFECTO']), ctrl.registrarAsistencia);

module.exports = router;
