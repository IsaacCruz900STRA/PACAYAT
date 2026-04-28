const prisma = require('../config/db');

async function getHorario(req, res) {
  const { idGrupo, idDocente } = req.query;
  const asignacionWhere = {};
  if (idGrupo) asignacionWhere.idGrupo = parseInt(idGrupo);
  if (idDocente) asignacionWhere.idDocente = parseInt(idDocente);

  try {
    const horarios = await prisma.horario.findMany({
      where: Object.keys(asignacionWhere).length ? { asignacion: asignacionWhere } : {},
      include: {
        asignacion: {
          include: {
            materia: { select: { nombre: true, grado: true } },
            docente: { select: { nombre: true } },
            grupo: { select: { nombre: true } },
          },
        },
      },
      orderBy: [{ dia: 'asc' }, { numeroClase: 'asc' }],
    });
    res.json({ horarios });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener horario' });
  }
}

async function createHorario(req, res) {
  const { idAsignacion, dia, numeroClase, salon } = req.body;
  if (!idAsignacion || !dia || !numeroClase) {
    return res.status(400).json({ message: 'idAsignacion, dia y numeroClase son obligatorios' });
  }
  if (parseInt(numeroClase) < 1 || parseInt(numeroClase) > 9) {
    return res.status(400).json({ message: 'El número de clase debe estar entre 1 y 9' });
  }
  try {
    const horario = await prisma.horario.create({
      data: {
        idAsignacion: parseInt(idAsignacion),
        dia,
        numeroClase: parseInt(numeroClase),
        salon: salon?.trim() || null,
      },
    });
    res.status(201).json(horario);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'Ya existe un horario en ese día y número de clase para esa asignación' });
    res.status(500).json({ message: 'Error al crear horario' });
  }
}

async function deleteHorario(req, res) {
  const { id } = req.params;
  try {
    await prisma.horario.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Horario eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar horario' });
  }
}

module.exports = { getHorario, createHorario, deleteHorario };
