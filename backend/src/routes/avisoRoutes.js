const express   = require('express');
const router    = express.Router();
const auth      = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');
const ctrl      = require('../controllers/avisoController');

const PUEDEN_GESTIONAR = ['ADMIN', 'DIRECTIVO', 'SECRETARIA'];

router.get('/',    auth,                           ctrl.getAvisos);
router.post('/',   auth, roleGuard(PUEDEN_GESTIONAR), ctrl.createAviso);
router.put('/:id', auth, roleGuard(PUEDEN_GESTIONAR), ctrl.updateAviso);
router.delete('/:id', auth, roleGuard(PUEDEN_GESTIONAR), ctrl.deleteAviso);

module.exports = router;
