const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');
const ctrl = require('../controllers/personalController');

router.get('/', auth, roleGuard(['ADMIN','DIRECTIVO','SECRETARIA','CONTROL_ESCOLAR']), ctrl.getPersonal);
router.post('/', auth, roleGuard(['ADMIN','SECRETARIA']), ctrl.createPersonal);
router.put('/:id', auth, roleGuard(['ADMIN','SECRETARIA']), ctrl.updatePersonal);
router.delete('/:id', auth, roleGuard(['ADMIN','SECRETARIA']), ctrl.deletePersonal);

module.exports = router;
