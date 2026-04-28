const express   = require('express');
const router    = express.Router();
const auth      = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');
const ctrl      = require('../controllers/inscripcionController');

router.get('/', auth, roleGuard(['ADMIN', 'SECRETARIA', 'CONTROL_ESCOLAR', 'DIRECTIVO']), ctrl.getInscripciones);

module.exports = router;
