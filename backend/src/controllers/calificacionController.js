const prisma = require('../config/db');

async function getCalificaciones(req, res) {
  const { idAlumno } = req.query;

  const where = {
    ...(idAlumno ? { inscripcion: { idAlumno: parseInt(idAlumno) } } : {}),
  };

  try {
    const calificaciones = await prisma.calificacion.findMany({
      where,
      orderBy: { actualizadoEn: 'desc' },
      include: {
        periodo: { select: { id: true, nombre: true, fechaInicio: true, fechaFin: true } },
        asignacion: {
          select: {
            materia: { select: { nombre: true, clave: true } },
            docente: { select: { nombre: true } },
            grupo: { select: { nombre: true } },
          },
        },
      },
    });

    const data = calificaciones.map(c => ({
      id: c.id,
      calificacion: c.calificacion,
      periodo: c.periodo?.nombre || '—',
      materia: c.asignacion?.materia?.nombre || '—',
      clave: c.asignacion?.materia?.clave || '',
      docente: c.asignacion?.docente?.nombre || '—',
      grupo: c.asignacion?.grupo?.nombre || '—',
      actualizadoEn: c.actualizadoEn,
    }));

    res.json({ calificaciones: data, total: data.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener calificaciones' });
  }
}

async function upsertCalificacion(req, res) {
  const { idInscripcion, idAsignacion, idPeriodo, calificacion } = req.body;

  if (!idInscripcion || !idAsignacion || !idPeriodo || calificacion === undefined) {
    return res.status(400).json({ message: 'idInscripcion, idAsignacion, idPeriodo y calificacion son obligatorios' });
  }

  const valor = parseFloat(calificacion);
  if (isNaN(valor) || valor < 0 || valor > 10) {
    return res.status(400).json({ message: 'La calificación debe estar entre 0 y 10' });
  }

  try {
    const result = await prisma.calificacion.upsert({
      where: {
        idInscripcion_idAsignacion_idPeriodo: {
          idInscripcion: parseInt(idInscripcion),
          idAsignacion: parseInt(idAsignacion),
          idPeriodo: parseInt(idPeriodo),
        },
      },
      update: { calificacion: valor },
      create: {
        idInscripcion: parseInt(idInscripcion),
        idAsignacion: parseInt(idAsignacion),
        idPeriodo: parseInt(idPeriodo),
        calificacion: valor,
      },
    });
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al guardar calificación' });
  }
}

async function updateCalificacion(req, res) {
  const { id } = req.params;
  const { calificacion } = req.body;

  const valor = parseFloat(calificacion);
  if (isNaN(valor) || valor < 0 || valor > 10) {
    return res.status(400).json({ message: 'La calificación debe estar entre 0 y 10' });
  }

  try {
    const updated = await prisma.calificacion.update({
      where: { id: parseInt(id) },
      data: { calificacion: valor },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar calificación' });
  }
}

module.exports = { getCalificaciones, upsertCalificacion, updateCalificacion };
