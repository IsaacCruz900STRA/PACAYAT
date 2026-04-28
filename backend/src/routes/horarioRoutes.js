const express   = require('express');
const router    = express.Router();
const auth      = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');
const ctrl      = require('../controllers/horarioController');

router.get('/', auth, ctrl.getHorario);
router.post('/', auth, roleGuard(['ADMIN', 'SECRETARIA', 'CONTROL_ESCOLAR']), ctrl.createHorario);
router.delete('/:id', auth, roleGuard(['ADMIN', 'SECRETARIA', 'CONTROL_ESCOLAR']), ctrl.deleteHorario);

module.exports = router;
