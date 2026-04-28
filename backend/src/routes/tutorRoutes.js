const express   = require('express');
const router    = express.Router();
const auth      = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');
const ctrl      = require('../controllers/tutorController');

router.get('/', auth, roleGuard(['ADMIN', 'SECRETARIA', 'CONTROL_ESCOLAR', 'DIRECTIVO']), ctrl.getTutores);
router.get('/:id', auth, ctrl.getTutor);
router.put('/:id', auth, roleGuard(['ADMIN', 'SECRETARIA']), ctrl.updateTutor);

module.exports = router;
