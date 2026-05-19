const prisma = require('../config/db');
const { generarPasswordTutor, hashPassword } = require('../services/passwordService');
const { sendTemporaryPassword } = require('../services/sendTemporaryPassword');

function usernameFromNombre(nombre) {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, 40);
}

const REQUIRED_MESSAGE = 'Todos los campos son obligatorios';

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function validateAlumnoPayload(body) {
  const required = [
    body.nombreCompleto,
    body.matricula,
    body.curp,
    body.fechaNacimiento,
    body.domicilio,
    body.grupo,
    body.tutor?.nombreCompleto,
    body.tutor?.telefono,
    body.tutor?.correo,
    body.tutor?.curp,
  ];
  return required.every(hasValue);
}

function sanitizeTutor(tutor) {
  return {
    nombreCompleto: tutor.nombreCompleto.trim(),
    telefono: tutor.telefono.trim(),
    correo: tutor.correo.trim().toLowerCase(),
    curp: tutor.curp.trim().toUpperCase(),
  };
}

async function findOrCreateTutor(tx, tutorData) {
  const tutor = sanitizeTutor(tutorData);

  // Buscar tutor existente por CURP (identificador único del tutor)
  const existing = await tx.tutor.findUnique({ where: { curp: tutor.curp } });

  if (existing) {
    // Mismo tutor: actualizar datos de contacto sin tocar credenciales
    return tx.tutor.update({
      where: { id: existing.id },
      data: {
        nombreCompleto: tutor.nombreCompleto,
        telefono: tutor.telefono,
        correo: tutor.correo,
      },
    });
  }

  // Tutor nuevo: generar contraseña temporal automáticamente
  const username = usernameFromNombre(tutor.nombreCompleto);
  const plainPassword = generarPasswordTutor();
  const password = await hashPassword(plainPassword);

  const usuarioData = { username, nombre: tutor.nombreCompleto, password, rol: 'TUTOR' };
  // Si la columna `changePassword` existe en el esquema, marcar para forzar cambio al primer login
  usuarioData.changePassword = true;
  
let usuario;
try {
  usuario = await tx.usuario.create({ 
    data: {
      ...usuarioData,
      changePassword: true,  // ✅ Agregar aquí
    }
  });
} catch (createErr) {
  console.error('Error al crear usuario:', createErr);
  throw createErr;
}
  const nuevoTutor = await tx.tutor.create({ data: { ...tutor, idUsuario: usuario.id } });

  // Enviar correo con la contraseña temporal (no bloquear la transacción si falla el envío)
  try {
    await sendTemporaryPassword(nuevoTutor.correo, plainPassword, nuevoTutor.nombreCompleto);
  } catch (mailErr) {
    console.error('Error enviando contraseña temporal:', mailErr);
  }

  return nuevoTutor;
}

async function findOrCreateGrupo(tx, nombre) {
  const existing = await tx.grupo.findUnique({ where: { nombre } });
  if (existing) return existing;

  const match = nombre.match(/^(\d+)°([A-Z])$/i);
  if (!match) throw new Error('El grupo seleccionado no es válido');

  return tx.grupo.create({
    data: {
      nombre,
      grado: parseInt(match[1]),
      seccion: match[2].toUpperCase(),
    },
  });
}

/**
 * GET /api/alumnos
 * Query: { q, grupo, estado, sort, page, limit }
 */
async function getAlumnos(req, res) {
  const { q = '', grupo = '', estado = '', sort = '', page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    AND: [
      q ? {
        OR: [
          { nombreCompleto: { contains: q, mode: 'insensitive' } },
          { matricula:      { contains: q, mode: 'insensitive' } },
        ],
      } : {},
      grupo  ? { inscripciones: { some: { grupo: { nombre: grupo }, activa: true } } } : {},
      estado ? { activo: estado === 'Activo' } : {},
    ],
  };

  try {
    const [alumnos, total] = await Promise.all([
      prisma.alumno.findMany({
        where, skip, take: parseInt(limit),
        orderBy: sort === 'puntaje' ? { puntosConducta: 'asc' } : { nombreCompleto: 'asc' },
        select: {
          id: true, matricula: true, nombreCompleto: true,
          puntosConducta: true, activo: true, grado: true,
          inscripciones: {
            where: { activa: true },
            select: { grupo: { select: { nombre: true } } },
            take: 1,
          },
          tutor: { select: { nombreCompleto: true } },
        },
      }),
      prisma.alumno.count({ where }),
    ]);

    const data = alumnos.map(a => ({
      id:             a.id,
      matricula:      a.matricula,
      nombreCompleto: a.nombreCompleto,
      puntosConducta: a.puntosConducta,
      activo:         a.activo,
      grado:          a.grado,
      estado:         a.activo ? 'Activo' : 'Inactivo',
      grupo:          a.inscripciones[0]?.grupo?.nombre || '—',
      tutor:          a.tutor?.nombreCompleto || '—',
    }));

    res.json({ alumnos: data, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener alumnos' });
  }
}

async function buscarAlumnos(req, res) {
  const { q = '' } = req.query;
  if (q.length < 2) return res.json([]);

  try {
    const alumnos = await prisma.alumno.findMany({
      where: {
        activo: true,
        OR: [
          { nombreCompleto: { contains: q, mode: 'insensitive' } },
          { matricula:      { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 8,
      select: {
        id: true, matricula: true, nombreCompleto: true, puntosConducta: true,
        inscripciones: {
          where: { activa: true },
          select: { grupo: { select: { nombre: true } } },
          take: 1,
        },
      },
    });

    const data = alumnos.map(a => ({
      id:             a.id,
      matricula:      a.matricula,
      nombre:         a.nombreCompleto,
      puntosConducta: a.puntosConducta,
      grupo:          a.inscripciones[0]?.grupo?.nombre || '—',
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error en la búsqueda' });
  }
}

async function validarMatricula(req, res) {
  const { matricula = '', excludeId = '' } = req.query;

  if (!hasValue(matricula)) {
    return res.status(400).json({ message: 'La matrícula es requerida' });
  }

  try {
    const alumno = await prisma.alumno.findUnique({
      where: { matricula: matricula.trim() },
      select: { id: true },
    });
    const disponible = !alumno || String(alumno.id) === String(excludeId);
    res.json({ disponible, existe: !disponible });
  } catch (err) {
    res.status(500).json({ message: 'Error al validar matrícula' });
  }
}

async function getAlumno(req, res) {
  const { id } = req.params;
  try {
    const alumno = await prisma.alumno.findUnique({
      where: { id: parseInt(id) },
      include: {
        inscripciones: {
          where: { activa: true },
          include: { grupo: true, periodoEscolar: true },
        },
        tutor: true,
      },
    });
    if (!alumno) return res.status(404).json({ message: 'Alumno no encontrado' });
    res.json(alumno);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el alumno' });
  }
}

async function createAlumno(req, res) {
  const { matricula, nombreCompleto, fechaNacimiento, curp, domicilio = '', grupo, tutor } = req.body;
  const puntosConducta = 100;

  if (!validateAlumnoPayload(req.body)) {
    return res.status(400).json({ message: REQUIRED_MESSAGE });
  }

  try {
    const periodoActivo = await prisma.periodoEscolar.findFirst({ where: { activo: true } });
    if (!periodoActivo) return res.status(400).json({ message: 'No existe un periodo escolar activo' });

    const alumno = await prisma.$transaction(async (tx) => {
      const grupoDb = await findOrCreateGrupo(tx, grupo);
      const tutorDb = await findOrCreateTutor(tx, tutor);
      const nuevoAlumno = await tx.alumno.create({
        data: {
          matricula: matricula.trim(),
          nombreCompleto: nombreCompleto.trim(),
          fechaNacimiento: new Date(fechaNacimiento),
          curp: curp.trim(),
          domicilio,
          puntosConducta,
          grado: grupoDb.grado,
          idGrupo: grupoDb.id,
          idTutor: tutorDb.id,
        },
      });

      await tx.inscripcion.create({
        data: {
          idAlumno: nuevoAlumno.id,
          idPeriodoEscolar: periodoActivo.id,
          idGrupo: grupoDb.id,
          activa: true,
        },
      });

      return nuevoAlumno;
    });

    res.status(201).json(alumno);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'La matrícula o CURP ya existe' });
    }
    if (err.message?.includes('contraseña') || err.message?.includes('CURP')) {
      return res.status(400).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: 'Error al crear el alumno' });
  }
}

async function updateAlumno(req, res) {
  const { id } = req.params;
  const { nombreCompleto, matricula, fechaNacimiento, domicilio = '', curp, puntosConducta, activo, grupo, tutor } = req.body;

  if (Object.keys(req.body).length === 1 && activo !== undefined) {
    try {
      const alumno = await prisma.alumno.update({
        where: { id: parseInt(id) },
        data: { activo: Boolean(activo) },
      });
      return res.json(alumno);
    } catch (err) {
      return res.status(500).json({ message: 'Error al actualizar el estado del alumno' });
    }
  }

  if (!validateAlumnoPayload(req.body)) {
    return res.status(400).json({ message: REQUIRED_MESSAGE });
  }

  try {
    const alumno = await prisma.$transaction(async (tx) => {
      const grupoDb = await findOrCreateGrupo(tx, grupo);
      const actual = await tx.alumno.findUnique({ where: { id: parseInt(id) } });
      if (!actual) throw new Error('Alumno no encontrado');

      const tutorDb = await findOrCreateTutor(tx, tutor);

      const actualizado = await tx.alumno.update({
        where: { id: parseInt(id) },
        data: {
          nombreCompleto: nombreCompleto.trim(),
          matricula: matricula.trim(),
          fechaNacimiento: new Date(fechaNacimiento),
          domicilio,
          curp: curp.trim(),
          puntosConducta: parseInt(puntosConducta),
          activo: Boolean(activo),
          grado: grupoDb.grado,
          idGrupo: grupoDb.id,
          idTutor: tutorDb.id,
        },
      });

      await tx.inscripcion.updateMany({
        where: { idAlumno: actualizado.id, activa: true },
        data: { idGrupo: grupoDb.id },
      });

      return actualizado;
    });

    res.json(alumno);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'La matrícula o CURP ya existe' });
    }
    res.status(500).json({ message: err.message || 'Error al actualizar el alumno' });
  }
}

async function deleteAlumno(req, res) {
  const { id } = req.params;
  try {
    await prisma.alumno.update({
      where: { id: parseInt(id) },
      data:  { activo: false },
    });
    res.json({ message: 'Alumno desactivado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el alumno' });
  }
}

module.exports = {
  getAlumnos,
  buscarAlumnos,
  validarMatricula,
  getAlumno,
  createAlumno,
  updateAlumno,
  deleteAlumno,
};
