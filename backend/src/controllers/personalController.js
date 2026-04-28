const prisma = require('../config/db');
const { generarPasswordPersonal, hashPassword } = require('../services/passwordService');

const REQUIRED_MESSAGE = 'Todos los campos son obligatorios';

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function usernameFromNombre(nombre) {
  const base = nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, 24);
  return `${base || 'personal'}.${Date.now().toString().slice(-5)}`;
}

function validatePersonalPayload(body) {
  const required = [body.nombre, body.rol, body.contacto ?? body.telefono, body.estado];
  if (!required.every(hasValue)) return false;
  if (body.rol === 'DOCENTE') {
    return hasValue(body.especialidad) && Array.isArray(body.materiaIds) && body.materiaIds.length > 0;
  }
  return true;
}

function materiaConnect(materiaIds = []) {
  return materiaIds.map(id => ({ id: parseInt(id) }));
}

async function getPersonal(req, res) {
  const { q = '', rol = '', estado = '' } = req.query;

  const where = {
    AND: [
      q ? { nombre: { contains: q, mode: 'insensitive' } } : {},
      rol ? { rol } : {},
      estado ? { activo: estado === 'Activo' } : {},
    ],
  };

  try {
    const [personal, total] = await Promise.all([
      prisma.personal.findMany({
        where,
        orderBy: { nombre: 'asc' },
        include: {
          materias: true,
          asignaciones: {
            where: { activo: true },
            include: { materia: true, grupo: true },
          },
        },
      }),
      prisma.personal.count({ where }),
    ]);

    const data = personal.map(p => ({
      id: p.id,
      nombre: p.nombre,
      rol: p.rol,
      contacto: p.contacto || p.telefono || '',
      telefono: p.contacto || p.telefono || '',
      correo: p.correo || '',
      especialidad: p.especialidad || p.curp || 'ninguno',
      activo: p.activo,
      estado: p.activo ? 'Activo' : 'Inactivo',
      materiaIds: p.materias.map(m => m.id),
      materias: p.materias,
      asignaciones: p.asignaciones.map(a => ({
        id: a.id,
        materia: a.materia.nombre,
        grado: a.grupo.grado,
        grupo: a.grupo.nombre,
      })),
    }));

    res.json({ personal: data, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener personal' });
  }
}

async function createPersonal(req, res) {
  const {
    nombre,
    rol,
    contacto,
    telefono,
    correo = '',
    estado,
    especialidad = 'ninguno',
    materiaIds = [],
  } = req.body;

  if (!validatePersonalPayload(req.body)) {
    return res.status(400).json({ message: REQUIRED_MESSAGE });
  }

  try {
    const personal = await prisma.$transaction(async (tx) => {
      const password = await hashPassword(generarPasswordPersonal(nombre.split(' ').at(-1) || nombre));
      const usuario = await tx.usuario.create({
        data: {
          username: usernameFromNombre(nombre),
          nombre: nombre.trim(),
          password,
          rol,
          activo: estado === 'Activo',
        },
      });

      const nuevo = await tx.personal.create({
        data: {
          nombre: nombre.trim(),
          rol,
          contacto: (contacto ?? telefono).trim(),
          telefono: (contacto ?? telefono).trim(),
          correo: correo.trim(),
          especialidad,
          curp: especialidad,
          activo: estado === 'Activo',
          idUsuario: usuario.id,
          materias: rol === 'DOCENTE' ? {
            connect: materiaConnect(materiaIds),
          } : undefined,
        },
      });

      return nuevo;
    });

    res.status(201).json(personal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear personal' });
  }
}

async function updatePersonal(req, res) {
  const { id } = req.params;
  const {
    nombre,
    rol,
    contacto,
    telefono,
    correo = '',
    estado,
    activo,
    especialidad = 'ninguno',
    materiaIds = [],
  } = req.body;

  if (Object.keys(req.body).length === 1 && activo !== undefined) {
    try {
      const personal = await prisma.personal.update({
        where: { id: parseInt(id) },
        data: { activo: Boolean(activo) },
      });
      await prisma.usuario.update({ where: { id: personal.idUsuario }, data: { activo: Boolean(activo) } });
      return res.json(personal);
    } catch (err) {
      return res.status(500).json({ message: 'Error al actualizar estado' });
    }
  }

  if (!validatePersonalPayload(req.body)) {
    return res.status(400).json({ message: REQUIRED_MESSAGE });
  }

  try {
    const personal = await prisma.$transaction(async (tx) => {
      const updated = await tx.personal.update({
        where: { id: parseInt(id) },
        data: {
          nombre: nombre.trim(),
          rol,
          contacto: (contacto ?? telefono).trim(),
          telefono: (contacto ?? telefono).trim(),
          correo: correo.trim(),
          especialidad,
          curp: especialidad,
          activo: estado === 'Activo',
          materias: {
            set: rol === 'DOCENTE' ? materiaConnect(materiaIds) : [],
          },
        },
      });

      await tx.usuario.update({
        where: { id: updated.idUsuario },
        data: { nombre: nombre.trim(), rol, activo: estado === 'Activo' },
      });

      return updated;
    });

    res.json(personal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar personal' });
  }
}

async function deletePersonal(req, res) {
  const { id } = req.params;
  try {
    const personal = await prisma.personal.update({
      where: { id: parseInt(id) },
      data: { activo: false },
    });
    await prisma.usuario.update({ where: { id: personal.idUsuario }, data: { activo: false } });
    res.json({ message: 'Personal desactivado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar personal' });
  }
}

module.exports = { getPersonal, createPersonal, updatePersonal, deletePersonal };
