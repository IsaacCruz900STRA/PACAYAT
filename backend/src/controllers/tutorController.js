const prisma = require('../config/db');

async function getTutores(req, res) {
  const { q = '', curp = '' } = req.query;
  const where = {};
  if (q) where.nombreCompleto = { contains: q, mode: 'insensitive' };
  if (curp) where.curp = curp.trim().toUpperCase();
  try {
    const tutores = await prisma.tutor.findMany({
      where,
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

async function getMisAlumnos(req, res) {
  try {
    const tutor = await prisma.tutor.findUnique({
      where: { idUsuario: req.user.id },
      include: {
        alumnos: {
          where: { activo: true },
          include: {
            inscripciones: {
              where: { activa: true },
              include: {
                grupo: true,
                asistencias: { select: { estado: true } },
                calificaciones: { select: { calificacion: true } },
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!tutor) return res.status(404).json({ message: 'Tutor no encontrado' });

    const hijos = tutor.alumnos.map(a => {
      const ins = a.inscripciones[0];
      const asistencias = ins?.asistencias || [];
      const calificaciones = ins?.calificaciones || [];
      const faltas = asistencias.filter(x => x.estado === 'FALTA').length;
      const promedio = calificaciones.length
        ? calificaciones.reduce((s, c) => s + c.calificacion, 0) / calificaciones.length
        : 0;
      return {
        id: a.id,
        nombre: a.nombreCompleto,
        matricula: a.matricula,
        grupo: ins?.grupo?.nombre || '—',
        puntosConducta: a.puntosConducta,
        faltas,
        promedio: Math.round(promedio * 10) / 10,
      };
    });

    res.json(hijos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener alumnos del tutor' });
  }
}

module.exports = { getTutores, getTutor, updateTutor, getMisAlumnos };
