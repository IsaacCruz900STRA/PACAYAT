const prisma = require('../config/db');

async function getAsistencia(req, res) {
  const { idAsignacion, idInscripcion, fecha } = req.query;
  const where = {};
  if (idAsignacion) where.idAsignacion = parseInt(idAsignacion);
  if (idInscripcion) where.idInscripcion = parseInt(idInscripcion);
  if (fecha) where.fecha = new Date(fecha);

  try {
    const asistencias = await prisma.asistencia.findMany({
      where,
      include: {
        inscripcion: {
          include: { alumno: { select: { nombreCompleto: true, matricula: true } } },
        },
        asignacion: {
          include: {
            materia: { select: { nombre: true } },
            grupo: { select: { nombre: true } },
          },
        },
      },
      orderBy: [{ fecha: 'desc' }],
    });
    res.json({ asistencias, total: asistencias.length });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener asistencia' });
  }
}

async function registrarAsistencia(req, res) {
  const registros = req.body;
  if (!Array.isArray(registros) || registros.length === 0) {
    return res.status(400).json({ message: 'Se requiere un arreglo de registros de asistencia' });
  }

  const invalido = registros.find(r => !r.idInscripcion || !r.idAsignacion || !r.fecha || !r.estado);
  if (invalido) {
    return res.status(400).json({ message: 'Cada registro requiere idInscripcion, idAsignacion, fecha y estado' });
  }

  try {
    const resultados = await prisma.$transaction(
      registros.map(r =>
        prisma.asistencia.upsert({
          where: {
            idInscripcion_idAsignacion_fecha: {
              idInscripcion: parseInt(r.idInscripcion),
              idAsignacion: parseInt(r.idAsignacion),
              fecha: new Date(r.fecha),
            },
          },
          update: { estado: r.estado },
          create: {
            idInscripcion: parseInt(r.idInscripcion),
            idAsignacion: parseInt(r.idAsignacion),
            fecha: new Date(r.fecha),
            estado: r.estado,
          },
        })
      )
    );
    res.status(201).json({ registrados: resultados.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar asistencia' });
  }
}

module.exports = { getAsistencia, registrarAsistencia };
