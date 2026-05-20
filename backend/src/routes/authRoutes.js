const express  = require('express');
const router   = express.Router();
const validate = require('../middlewares/validate');
const { loginSchema, forgotPasswordSchema } = require('../schemas/authSchemas');
const auth = require('../middlewares/auth');

const {
  getUsuariosPorRol,
  login,
  logout,
  forgotPassword,
  verificarCodigo,
  nuevaPassword,
  changePassword,
} = require('../controllers/authController');

router.get('/usuarios-por-rol/:rol', getUsuariosPorRol);

router.post('/login',           validate(loginSchema),          login);
router.post('/logout',          logout);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/verificar-codigo', verificarCodigo);
router.post('/nueva-password',   nuevaPassword);
router.post('/change-password',  auth, changePassword);

module.exports = router;
