const prisma = require('../config/db');

async function getAvisos(req, res) {
  const { tipo, activo } = req.query;
  const where = {};
  if (tipo) where.tipo = tipo;
  if (activo !== undefined) where.activo = activo === 'true';

  try {
    const avisos = await prisma.aviso.findMany({
      where,
      orderBy: { creadoEn: 'desc' },
    });
    res.json({ avisos, total: avisos.length });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener avisos' });
  }
}

async function createAviso(req, res) {
  const { tipo, titulo, mensaje, umbralPuntos, canales = [] } = req.body;
  if (!tipo || !titulo || !mensaje) {
    return res.status(400).json({ message: 'tipo, titulo y mensaje son obligatorios' });
  }
  try {
    const aviso = await prisma.aviso.create({
      data: {
        tipo,
        titulo: titulo.trim(),
        mensaje: mensaje.trim(),
        umbralPuntos: umbralPuntos ? parseInt(umbralPuntos) : null,
        canales,
      },
    });
    res.status(201).json(aviso);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear aviso' });
  }
}

async function updateAviso(req, res) {
  const { id } = req.params;
  const { tipo, titulo, mensaje, umbralPuntos, canales, activo } = req.body;
  try {
    const aviso = await prisma.aviso.update({
      where: { id: parseInt(id) },
      data: {
        ...(tipo !== undefined && { tipo }),
        ...(titulo !== undefined && { titulo: titulo.trim() }),
        ...(mensaje !== undefined && { mensaje: mensaje.trim() }),
        ...(umbralPuntos !== undefined && { umbralPuntos: parseInt(umbralPuntos) }),
        ...(canales !== undefined && { canales }),
        ...(activo !== undefined && { activo: Boolean(activo) }),
      },
    });
    res.json(aviso);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar aviso' });
  }
}

async function deleteAviso(req, res) {
  const { id } = req.params;
  try {
    await prisma.aviso.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Aviso eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar aviso' });
  }
}

module.exports = { getAvisos, createAviso, updateAviso, deleteAviso };
