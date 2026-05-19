const prisma  = require('../config/db');
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const {
  enviarCodigoRecuperacion
} = require('../services/mailService');

const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutos
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

    // Determinar si el usuario debe forzar cambio de contraseña.
    // Si la consulta Prisma ya incluye el campo `changePassword`, usarlo.
    let changePasswordFlag = false;
    if (Object.prototype.hasOwnProperty.call(usuario, 'changePassword')) {
      changePasswordFlag = Boolean(usuario.changePassword);
    } else {
      // Compatibilidad: intentar leer la columna directamente desde la tabla si existe
      try {
        const rows = await prisma.$queryRaw`SELECT change_password FROM usuarios WHERE id = ${usuario.id}`;
        if (rows && rows[0] && Object.prototype.hasOwnProperty.call(rows[0], 'change_password')) {
          changePasswordFlag = Boolean(rows[0].change_password);
        }
      } catch (err) {
        console.warn('No se pudo leer change_password desde DB:', err.message || err);
        changePasswordFlag = false;
      }
    }

    res.json({
      token,
      usuario: {
        id:       usuario.id,
        nombre:   usuario.nombre,
        username: usuario.username,
        rol:      usuario.rol,
        changePassword: changePasswordFlag,
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

    // Buscar en personal (ordenable para determinismo)
    let usuario = await prisma.personal.findFirst({
      where: { correo: email, activo: true },
      include: { usuario: true },
      orderBy: { id: 'asc' },
    });

    // Si no existe, buscar en tutores
    if (!usuario) {
      usuario = await prisma.tutor.findFirst({
        where: { correo: email },
        include: { usuario: true },
        orderBy: { id: 'asc' },
      });
    }

    if (usuario) {

      console.log('Usuario encontrado para recuperación. Resumen del registro encontrado:');
      try {
        // Loguear datos útiles sin exponer hashes
        const resumen = {
          tabla: usuario.hasOwnProperty('idUsuario') ? 'tutores' : 'personal',
          registroId: usuario.id,
          nombre: usuario.nombreCompleto || usuario.nombre,
          correo: usuario.correo,
          idUsuarioRelacionado: usuario.usuario?.id,
          usernameRelacionado: usuario.usuario?.username,
        };
        console.log(JSON.stringify(resumen));
      } catch (logErr) {
        console.warn('No se pudo formatear resumen de usuario encontrado:', logErr.message || logErr);
      }

      const codigo = Math.floor(100000 + Math.random() * 900000).toString();
      const expiracion = new Date(Date.now() + 15 * 60 * 1000);

      const usuarioId = usuario.usuario?.id;
      if (!usuarioId) {
        console.warn('No se encontró id de usuario asociado para el correo:', email);
      } else {
        try {
          await prisma.usuario.update({ where: { id: usuarioId }, data: { resetCode: codigo, resetCodeExp: expiracion } });
        } catch (updateErr) {
          console.error('Error al guardar resetCode/resetCodeExp en DB para usuarioId', usuarioId, updateErr.message || updateErr);
        }

        try {
          await enviarCodigoRecuperacion(email, codigo);
        } catch (mailErr) {
          console.error('Error enviando código de recuperación por correo a', email, mailErr.message || mailErr);
        }

        console.log('Código enviado (si no hubo errores):', codigo, 'usuarioId:', usuarioId);
      }

      // Para depuración: listar todas las entradas que coinciden con ese correo en personal y tutores
      try {
        const personals = await prisma.personal.findMany({ where: { correo: email }, select: { id: true, idUsuario: true, nombre: true, activo: true } });
        const tutors = await prisma.tutor.findMany({ where: { correo: email }, select: { id: true, idUsuario: true, nombreCompleto: true } });
        console.log('Entradas encontradas con ese correo — personal:', JSON.stringify(personals), 'tutores:', JSON.stringify(tutors));
      } catch (listErr) {
        console.warn('Error al listar entradas para depuración:', listErr.message || listErr);
      }

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

/**
 * POST /api/auth/verificar-codigo
 * Body: { correo, codigo }
 * Respuesta: { ok: true, message: 'Código válido' }
 */
async function verificarCodigo(req, res) {
  const { correo, codigo } = req.body;

  if (!correo || !codigo) {
    return res.status(400).json({
      ok: false,
      message: 'El correo y el código son requeridos'
    });
  }

  try {
    // Buscar el usuario por correo (en personal o tutores)
    let usuario = await prisma.personal.findFirst({
      where: {
        correo: correo,
        activo: true
      },
      include: {
        usuario: true
      },
      orderBy: { id: 'asc' },
    });

    if (!usuario) {
      usuario = await prisma.tutor.findFirst({
        where: {
          correo: correo
        },
        include: {
          usuario: true
        },
        orderBy: { id: 'asc' },
      });
    }

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado'
      });
    }

    const usuarioData = usuario.usuario;

    // Validar que el código exista
    if (!usuarioData.resetCode) {
      return res.status(400).json({
        ok: false,
        message: 'No hay código de recuperación activo'
      });
    }

    // Validar que el código sea correcto
    if (usuarioData.resetCode !== codigo) {
      return res.status(400).json({
        ok: false,
        message: 'Código incorrecto'
      });
    }

    // Validar que el código no haya expirado
    if (new Date() > usuarioData.resetCodeExp) {
      return res.status(400).json({
        ok: false,
        message: 'El código ha expirado. Solicita uno nuevo.'
      });
    }

    // Código válido
    return res.json({
      ok: true,
      message: 'Código válido'
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      ok: false,
      message: 'Error al verificar el código'
    });
  }
}

/**
 * POST /api/auth/nueva-password
 * Body: { correo, codigo, nuevaPassword }
 * Respuesta: { ok: true, message: 'Contraseña actualizada' }
 */
async function nuevaPassword(req, res) {
  const { correo, codigo, nuevaPassword } = req.body;

  if (!correo || !codigo || !nuevaPassword) {
    return res.status(400).json({
      ok: false,
      message: 'El correo, código y nueva contraseña son requeridos'
    });
  }

  try {
    // Buscar el usuario por correo (en personal o tutores)
    let usuario = await prisma.personal.findFirst({
      where: {
        correo: correo,
        activo: true
      },
      include: {
        usuario: true
      },
      orderBy: { id: 'asc' },
    });

    if (!usuario) {
      usuario = await prisma.tutor.findFirst({
        where: {
          correo: correo
        },
        include: {
          usuario: true
        },
        orderBy: { id: 'asc' },
      });
    }

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado'
      });
    }

    const usuarioData = usuario.usuario;

    // Validar que el código sea correcto
    if (usuarioData.resetCode !== codigo) {
      return res.status(400).json({
        ok: false,
        message: 'Código incorrecto'
      });
    }

    // Validar que el código no haya expirado
    if (new Date() > usuarioData.resetCodeExp) {
      return res.status(400).json({
        ok: false,
        message: 'El código ha expirado. Solicita uno nuevo.'
      });
    }

    // Hashear la nueva contraseña
    const passwordHasheada = await bcrypt.hash(nuevaPassword, 10);

    // Intentar actualizar la contraseña, limpiar campos de recuperación y desactivar change_password
    try {
      await prisma.usuario.update({
        where: { id: usuarioData.id },
        data: {
          password: passwordHasheada,
          resetCode: null,
          resetCodeExp: null,
          changePassword: false,
        },
      });
    } catch (err) {
      // Si el cliente Prisma no conoce el campo changePassword, intentar sin él y ejecutar raw SQL para limpiar la columna física si existe
      console.warn('Prisma update con changePassword falló, reintentando sin el campo:', err.message || err);
      await prisma.usuario.update({
        where: { id: usuarioData.id },
        data: { password: passwordHasheada, resetCode: null, resetCodeExp: null },
      });
      try {
        await prisma.$executeRaw`UPDATE usuarios SET change_password = false WHERE id = ${usuarioData.id}`;
      } catch (rawErr) {
        console.warn('No se pudo limpiar change_password en DB (posiblemente columna ausente):', rawErr.message || rawErr);
      }
    }

    // Leer usuario actualizado para devolver info útil al cliente
    let usuarioActualizado = null;
    try {
      usuarioActualizado = await prisma.usuario.findUnique({
        where: { id: usuarioData.id },
        select: { id: true, username: true, nombre: true, rol: true, changePassword: true },
      });
    } catch (fetchErr) {
      console.warn('No se pudo obtener usuario actualizado después de cambiar contraseña:', fetchErr.message || fetchErr);
    }

    return res.json({ ok: true, message: 'Contraseña actualizada exitosamente', usuario: usuarioActualizado });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      ok: false,
      message: 'Error al actualizar la contraseña'
    });
  }
}

/**
 * POST /api/auth/change-password
 * Body: { nuevaPassword }
 * Requiere auth (token) para identificar al usuario.
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

    // Intentar actualizar incluyendo el campo `changePassword` (si el cliente Prisma está al día)
    try {
      await prisma.usuario.update({
        where: { id: usuarioId },
        data: { password: hashed, resetCode: null, resetCodeExp: null, changePassword: false },
      });
    } catch (err) {
      // Si falla (por ejemplo el cliente Prisma no tiene el campo), intentar sin el campo y, adicionalmente, ejecutar SQL raw para limpiar la columna si existe.
      try {
        await prisma.usuario.update({
          where: { id: usuarioId },
          data: { password: hashed, resetCode: null, resetCodeExp: null },
        });
      } catch (err2) {
        console.error('Error al actualizar contraseña sin changePassword field:', err2.message || err2);
        throw err2;
      }

      try {
        await prisma.$executeRaw`UPDATE usuarios SET change_password = false WHERE id = ${usuarioId}`;
      } catch (err3) {
        console.warn('No se pudo limpiar change_password en DB (posiblemente columna ausente):', err3.message || err3);
      }
    }

    // Devolver estado actualizado del usuario para que el frontend actualice su cache
    let usuarioActualizado = null;
    try {
      usuarioActualizado = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { id: true, username: true, nombre: true, rol: true, changePassword: true },
      });
    } catch (err) {
      // Si falla, devolver respuesta genérica
      console.warn('No se pudo obtener usuario actualizado:', err.message || err);
    }

    return res.json({ ok: true, message: 'Contraseña cambiada exitosamente', usuario: usuarioActualizado });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'Error al cambiar la contraseña' });
  }
}

// controllers/auth.controller.js

module.exports = {
  getUsuariosPorRol,
  login,
  forgotPassword,
  verificarCodigo,
  nuevaPassword,
  changePassword,
};