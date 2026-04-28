const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/materiaController');

router.get('/', auth, ctrl.getMaterias);

module.exports = router;
