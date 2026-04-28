const prisma = require('../config/db');

async function getTutores(req, res) {
  const { q = '' } = req.query;
  try {
    const tutores = await prisma.tutor.findMany({
      where: q ? { nombreCompleto: { contains: q, mode: 'insensitive' } } : {},
      orderBy: { nombreCompleto: 'asc' },
      include: {
        alumnos: { select: { id: true, nombreCompleto: true, matricula: true, activo: true } },
      },
    });
    res.json({ tutores, total: tutores.length });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener tutores' });
  }
}

async function getTutor(req, res) {
  const { id } = req.params;
  try {
    const tutor = await prisma.tutor.findUnique({
      where: { id: parseInt(id) },
      include: {
        alumnos: {
          include: {
            inscripciones: {
              where: { activa: true },
              include: { grupo: true },
              take: 1,
            },
          },
        },
      },
    });
    if (!tutor) return res.status(404).json({ message: 'Tutor no encontrado' });
    res.json(tutor);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener tutor' });
  }
}

async function updateTutor(req, res) {
  const { id } = req.params;
  const { nombreCompleto, telefono, correo } = req.body;
  if (!nombreCompleto) return res.status(400).json({ message: 'El nombre es obligatorio' });
  try {
    const tutor = await prisma.tutor.update({
      where: { id: parseInt(id) },
      data: {
        nombreCompleto: nombreCompleto.trim(),
        telefono: telefono?.trim() || null,
        correo: correo?.trim().toLowerCase() || null,
      },
    });
    res.json(tutor);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar tutor' });
  }
}

module.exports = { getTutores, getTutor, updateTutor };
