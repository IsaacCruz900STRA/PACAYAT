const prisma         = require('../config/db');
const jwt            = require('jsonwebtoken');
const bcrypt         = require('bcryptjs');
const tokenBlacklist = require('../config/tokenBlacklist');
const {
  enviarCodigoRecuperacion
} = require('../services/mailService');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 8 * 60 * 60 * 1000,
  path: '/',
};

const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_DURATION_MS = 5 * 60 * 1000;
const loginAttemptStore = new Map();

function getAttemptKey(username, rol) {
  return `${String(username).trim().toLowerCase()}:${String(rol).trim().toUpperCase()}`;
}

function getRemainingLockSeconds(lockUntil) {
  return Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
}

function recordFailedLoginAttempt(key) {
  const current = loginAttemptStore.get(key) || { count: 0, lockedUntil: null };
  current.count += 1;

  if (current.count >= MAX_LOGIN_ATTEMPTS) {
    current.lockedUntil = Date.now() + LOCK_DURATION_MS;
    current.count = 0;
  }

  loginAttemptStore.set(key, current);
  return current;
}

function resetLoginAttempts(key) {
  loginAttemptStore.delete(key);
}

/**
 * GET /api/auth/usuarios-por-rol/:rol
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
 */
async function login(req, res) {
  const { username, password, rol } = req.body;
  const attemptKey = getAttemptKey(username, rol);

  if (!username || !password || !rol) {
    return res.status(400).json({ message: 'Faltan campos requeridos' });
  }

  const attemptState = loginAttemptStore.get(attemptKey);
  if (attemptState?.lockedUntil && attemptState.lockedUntil > Date.now()) {
    const secondsLeft = getRemainingLockSeconds(attemptState.lockedUntil);
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const timeText = minutes > 0 ? `${minutes} min${minutes > 1 ? 's' : ''}` : `${seconds} seg${seconds > 1 ? 's' : ''}`;
    return res.status(423).json({ message: `Usuario bloqueado. Intenta de nuevo en ${timeText}.` });
  }

  try {
    const usuario = await prisma.usuario.findFirst({
      where: { username, rol, activo: true },
    });

    if (!usuario) {
      const failed = recordFailedLoginAttempt(attemptKey);
      if (failed.lockedUntil) {
        return res.status(423).json({ message: 'Demasiados intentos fallidos. Usuario bloqueado por 5 minutos.' });
      }
      const attemptsLeft = MAX_LOGIN_ATTEMPTS - failed.count;
      return res.status(401).json({ message: `Usuario no encontrado o inactivo. Te quedan ${attemptsLeft} intento${attemptsLeft === 1 ? '' : 's'}.` });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      const failed = recordFailedLoginAttempt(attemptKey);
      if (failed.lockedUntil) {
        return res.status(423).json({ message: 'Demasiados intentos fallidos. Usuario bloqueado por 5 minutos.' });
      }
      const attemptsLeft = MAX_LOGIN_ATTEMPTS - failed.count;
      return res.status(401).json({ message: `Contraseña incorrecta. Te quedan ${attemptsLeft} intento${attemptsLeft === 1 ? '' : 's'}.` });
    }

    resetLoginAttempts(attemptKey);

    const token = jwt.sign(
      { id: usuario.id, username: usuario.username, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    let changePasswordFlag = false;
    if (Object.prototype.hasOwnProperty.call(usuario, 'changePassword')) {
      changePasswordFlag = Boolean(usuario.changePassword);
    } else {
      try {
        const rows = await prisma.$queryRaw`SELECT change_password FROM usuarios WHERE id = ${usuario.id}`;
        if (rows && rows[0] && Object.prototype.hasOwnProperty.call(rows[0], 'change_password')) {
          changePasswordFlag = Boolean(rows[0].change_password);
        }
      } catch (err) {
        console.warn('No se pudo leer change_password desde DB:', err.message || err);
      }
    }

    res.cookie('pacayat_token', token, COOKIE_OPTIONS);

    res.json({
      usuario: {
        id:             usuario.id,
        nombre:         usuario.nombre,
        username:       usuario.username,
        rol:            usuario.rol,
        changePassword: changePasswordFlag,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}

/**
 * POST /api/auth/logout
 * Invalida el token en la blacklist y limpia la cookie.
 */
function logout(req, res) {
  const token = req.cookies?.pacayat_token;
  if (token) {
    const decoded = jwt.decode(token);
    const expiresAt = decoded?.exp
      ? decoded.exp * 1000
      : Date.now() + 8 * 60 * 60 * 1000;
    tokenBlacklist.add(token, expiresAt);
  }
  res.clearCookie('pacayat_token', { path: '/' });
  res.json({ message: 'Sesión cerrada correctamente' });
}

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 */
async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'El correo electrónico es requerido' });
  }

  try {
    let usuario = await prisma.personal.findFirst({
      where: { correo: email, activo: true },
      include: { usuario: true },
      orderBy: { id: 'asc' },
    });

    if (!usuario) {
      usuario = await prisma.tutor.findFirst({
        where: { correo: email },
        include: { usuario: true },
        orderBy: { id: 'asc' },
      });
    }

    if (usuario) {
      const codigo = Math.floor(100000 + Math.random() * 900000).toString();
      const expiracion = new Date(Date.now() + 15 * 60 * 1000);
      const usuarioId = usuario.usuario?.id;

      if (usuarioId) {
        try {
          await prisma.usuario.update({ where: { id: usuarioId }, data: { resetCode: codigo, resetCodeExp: expiracion } });
        } catch (updateErr) {
          console.error('Error al guardar resetCode:', updateErr.message || updateErr);
        }
        try {
          await enviarCodigoRecuperacion(email, codigo);
        } catch (mailErr) {
          console.error('Error enviando código:', mailErr.message || mailErr);
        }
      }
    }

    return res.json({ ok: true, message: 'Si el correo está registrado, recibirás instrucciones.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Error al procesar la solicitud' });
  }
}

/**
 * POST /api/auth/verificar-codigo
 * Body: { correo, codigo }
 */
async function verificarCodigo(req, res) {
  const { correo, codigo } = req.body;

  if (!correo || !codigo) {
    return res.status(400).json({ ok: false, message: 'El correo y el código son requeridos' });
  }

  try {
    let usuario = await prisma.personal.findFirst({
      where: { correo, activo: true },
      include: { usuario: true },
      orderBy: { id: 'asc' },
    });

    if (!usuario) {
      usuario = await prisma.tutor.findFirst({
        where: { correo },
        include: { usuario: true },
        orderBy: { id: 'asc' },
      });
    }

    if (!usuario) {
      return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
    }

    const usuarioData = usuario.usuario;

    if (!usuarioData.resetCode) {
      return res.status(400).json({ ok: false, message: 'No hay código de recuperación activo' });
    }
    if (usuarioData.resetCode !== codigo) {
      return res.status(400).json({ ok: false, message: 'Código incorrecto' });
    }
    if (new Date() > usuarioData.resetCodeExp) {
      return res.status(400).json({ ok: false, message: 'El código ha expirado. Solicita uno nuevo.' });
    }

    return res.json({ ok: true, message: 'Código válido' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Error al verificar el código' });
  }
}

/**
 * POST /api/auth/nueva-password
 * Body: { correo, codigo, nuevaPassword }
 */
async function nuevaPassword(req, res) {
  const { correo, codigo, nuevaPassword } = req.body;

  if (!correo || !codigo || !nuevaPassword) {
    return res.status(400).json({ ok: false, message: 'El correo, código y nueva contraseña son requeridos' });
  }

  try {
    let usuario = await prisma.personal.findFirst({
      where: { correo, activo: true },
      include: { usuario: true },
      orderBy: { id: 'asc' },
    });

    if (!usuario) {
      usuario = await prisma.tutor.findFirst({
        where: { correo },
        include: { usuario: true },
        orderBy: { id: 'asc' },
      });
    }

    if (!usuario) {
      return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
    }

    const usuarioData = usuario.usuario;

    if (usuarioData.resetCode !== codigo) {
      return res.status(400).json({ ok: false, message: 'Código incorrecto' });
    }
    if (new Date() > usuarioData.resetCodeExp) {
      return res.status(400).json({ ok: false, message: 'El código ha expirado. Solicita uno nuevo.' });
    }

    const passwordHasheada = await bcrypt.hash(nuevaPassword, 10);

    try {
      await prisma.usuario.update({
        where: { id: usuarioData.id },
        data: { password: passwordHasheada, resetCode: null, resetCodeExp: null, changePassword: false },
      });
    } catch (err) {
      await prisma.usuario.update({
        where: { id: usuarioData.id },
        data: { password: passwordHasheada, resetCode: null, resetCodeExp: null },
      });
      try {
        await prisma.$executeRaw`UPDATE usuarios SET change_password = false WHERE id = ${usuarioData.id}`;
      } catch (rawErr) {
        console.warn('No se pudo limpiar change_password:', rawErr.message || rawErr);
      }
    }

    let usuarioActualizado = null;
    try {
      usuarioActualizado = await prisma.usuario.findUnique({
        where: { id: usuarioData.id },
        select: { id: true, username: true, nombre: true, rol: true, changePassword: true },
      });
    } catch (fetchErr) {
      console.warn('No se pudo obtener usuario actualizado:', fetchErr.message || fetchErr);
    }

    return res.json({ ok: true, message: 'Contraseña actualizada exitosamente', usuario: usuarioActualizado });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Error al actualizar la contraseña' });
  }
}

/**
 * POST /api/auth/change-password
 * Body: { nuevaPassword }
 * Requiere auth.
 */
async function changePassword(req, res) {
  const { nuevaPassword } = req.body;
  const usuarioId = req.usuario?.id;

  if (!usuarioId) return res.status(401).json({ message: 'No autenticado' });
  if (!nuevaPassword || typeof nuevaPassword !== 'string' || nuevaPassword.trim().length < 6) {
    return res.status(400).json({ message: 'La nueva contraseña es obligatoria y debe tener al menos 6 caracteres' });
  }

  try {
    const hashed = await bcrypt.hash(nuevaPassword.trim(), 10);

    try {
      await prisma.usuario.update({
        where: { id: usuarioId },
        data: { password: hashed, resetCode: null, resetCodeExp: null, changePassword: false },
      });
    } catch (err) {
      await prisma.usuario.update({
        where: { id: usuarioId },
        data: { password: hashed, resetCode: null, resetCodeExp: null },
      });
      try {
        await prisma.$executeRaw`UPDATE usuarios SET change_password = false WHERE id = ${usuarioId}`;
      } catch (rawErr) {
        console.warn('No se pudo limpiar change_password:', rawErr.message || rawErr);
      }
    }

    let usuarioActualizado = null;
    try {
      usuarioActualizado = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { id: true, username: true, nombre: true, rol: true, changePassword: true },
      });
    } catch (err) {
      console.warn('No se pudo obtener usuario actualizado:', err.message || err);
    }

    return res.json({ ok: true, message: 'Contraseña cambiada exitosamente', usuario: usuarioActualizado });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Error al cambiar la contraseña' });
  }
}

/**
 * GET /api/auth/me
 * Devuelve el usuario real según el JWT de la cookie — no confía en localStorage.
 */
async function me(req, res) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      select: { id: true, username: true, nombre: true, rol: true, changePassword: true, activo: true },
    });
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ message: 'Sesión inválida' });
    }
    res.json({ usuario });
  } catch {
    res.status(500).json({ message: 'Error al verificar sesión' });
  }
}

module.exports = {
  getUsuariosPorRol,
  login,
  logout,
  me,
  forgotPassword,
  verificarCodigo,
  nuevaPassword,
  changePassword,
};
