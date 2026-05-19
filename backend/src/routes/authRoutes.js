const express = require('express');
const router  = express.Router();

const {
    getUsuariosPorRol,
    login,
    forgotPassword,
    verificarCodigo,
    nuevaPassword,
    changePassword
} = require('../controllers/authController');

const auth = require('../middlewares/auth');

router.get('/usuarios-por-rol/:rol', getUsuariosPorRol);

router.post('/login', login);

router.post('/forgot-password', forgotPassword);
router.post('/verificar-codigo', verificarCodigo);
router.post('/nueva-password', nuevaPassword);
router.post('/change-password', auth, changePassword);

module.exports = router;