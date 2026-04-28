const express   = require('express');
const router    = express.Router();
const auth      = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');
const ctrl      = require('../controllers/avisoController');

router.get('/', auth, ctrl.getAvisos);
router.post('/', auth, roleGuard(['ADMIN']), ctrl.createAviso);
router.put('/:id', auth, roleGuard(['ADMIN']), ctrl.updateAviso);
router.delete('/:id', auth, roleGuard(['ADMIN']), ctrl.deleteAviso);

module.exports = router;
