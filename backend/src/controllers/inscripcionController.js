const prisma = require('../config/db');

async function getInscripciones(req, res) {
  const { idAlumno, idPeriodo, activa, idGrupo } = req.query;
  const where = {};
  if (idAlumno) where.idAlumno = parseInt(idAlumno);
  if (idPeriodo) where.idPeriodoEscolar = parseInt(idPeriodo);
  if (activa !== undefined) where.activa = activa === 'true';
  if (idGrupo) where.idGrupo = parseInt(idGrupo);

  try {
    const inscripciones = await prisma.inscripcion.findMany({
      where,
      include: {
        alumno: { select: { nombreCompleto: true, matricula: true, puntosConducta: true } },
        periodoEscolar: { select: { nombre: true } },
        grupo: { select: { nombre: true, grado: true } },
      },
      orderBy: { creadoEn: 'desc' },
    });
    res.json({ inscripciones, total: inscripciones.length });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener inscripciones' });
  }
}

module.exports = { getInscripciones };
