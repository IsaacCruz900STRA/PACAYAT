const express   = require('express');
const router    = express.Router();
const auth      = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');
const ctrl      = require('../controllers/grupoController');

router.get('/', auth, ctrl.getGrupos);
router.post('/', auth, roleGuard(['ADMIN', 'SECRETARIA']), ctrl.createGrupo);
router.delete('/:id', auth, roleGuard(['ADMIN']), ctrl.deleteGrupo);

module.exports = router;
