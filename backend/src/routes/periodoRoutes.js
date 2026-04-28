const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');
const ctrl = require('../controllers/periodoController');

router.get('/activo', auth, ctrl.getPeriodoActivo);
router.get('/', auth, ctrl.getPeriodos);
router.put('/:id', auth, roleGuard(['ADMIN','SECRETARIA','CONTROL_ESCOLAR']), ctrl.updatePeriodo);

module.exports = router;
