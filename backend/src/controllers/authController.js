const prisma  = require('../config/db');
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const {
  enviarCodigoRecuperacion
} = require('../services/mailService');

/**
 * GET /api/auth/usuarios-por-rol/:rol
 * Devuelve la lista de usuarios (nombre + username) para el desplegable del login.
 * NO devuelve contraseñas.
 */
async function getUsuariosPorRol(req, res) {
  const { rol } = req.params;
  try {
    const usuarios = await prisma.usuario.findMany({
      where:  { rol, activo: true },
      select: { id: true, username: true, nombre: true },
      orderBy: { nombre: 'asc' },
    });
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
}

/**
 * POST /api/auth/login
 * Body: { username, password, rol }
 * Respuesta: { token, usuario: { id, nombre, rol, username } }
 */
async function login(req, res) {
  const { username, password, rol } = req.body;

  if (!username || !password || !rol) {
    return res.status(400).json({ message: 'Faltan campos requeridos' });
  }

  try {
    const usuario = await prisma.usuario.findFirst({
      where: { username, rol, activo: true },
    });

    if (!usuario) {
      return res.status(401).json({ message: 'Usuario no encontrado o inactivo' });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: usuario.id, username: usuario.username, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      token,
      usuario: {
        id:       usuario.id,
        nombre:   usuario.nombre,
        username: usuario.username,
        rol:      usuario.rol,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 * Respuesta: { message: 'Código enviado a tu correo' }
 */


async function forgotPassword(req, res) {

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: 'El correo electrónico es requerido'
    });
  }

  try {

    // Buscar en personal
    let usuario = await prisma.personal.findFirst({
      where: {
        correo: email,
        activo: true
      },
      include: {
        usuario: true
      }
    });

    // Si no existe, buscar en tutores
    if (!usuario) {

      usuario = await prisma.tutor.findFirst({
        where: {
          correo: email
        },
        include: {
          usuario: true
        }
      });

    }

    if (usuario) {

      console.log('Usuario encontrado');

      // aquí luego:
      // generar token
      // enviar correo
      const codigo =
      Math.floor(
      100000 + Math.random() * 900000
      ).toString();

      const expiracion = new Date(
  Date.now() + 15 * 60 * 1000
);
await prisma.usuario.update({
  where: {
    id: usuario.usuario.id
  },
  data: {
    resetCode: codigo,
    resetCodeExp: expiracion
  }
});
await enviarCodigoRecuperacion(
  email,
  codigo
);

  console.log('Código:', codigo);

    }   else {

      console.log('Usuario no encontrado');

    }

    return res.json({
      ok: true,
      message:
        'Si el correo está registrado, recibirás instrucciones.'
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      ok: false,
      message: 'Error al procesar la solicitud'
    });
  }
}
// controllers/auth.controller.js

module.exports = {
  getUsuariosPorRol,
  login,
  forgotPassword,
};