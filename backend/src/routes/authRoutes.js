const express = require('express');
const router  = express.Router();

const {
    getUsuariosPorRol,
    login,
    forgotPassword
} = require('../controllers/authController');

router.get('/usuarios-por-rol/:rol', getUsuariosPorRol);

router.post('/login', login);

router.post('/forgot-password', forgotPassword);

module.exports = router;