// src/controllers/tutorController.js
const prisma = require('../config/db');

/**
 * GET /api/tutor/mis-hijos
 * Devuelve los alumnos vinculados al tutor autenticado.
 */
async function getMisHijos(req, res) {
  const idTutor = req.usuario.id;
  try {
    const vinculaciones = await prisma.tutorAlumno.findMany({
      where: { idTutor },
      include: {
        alumno: {
          select: {
            id: true, nombreCompleto: true, puntosConducta: true,
            inscripciones: {
              where: { activa: true },
              select: { grupo: { select: { nombre: true } } },
              take: 1,
            },
          },
        },
      },
    });

    const hijos = vinculaciones.map(v => ({
      id:             v.alumno.id,
      nombre:         v.alumno.nombreCompleto,
      puntosConducta: v.alumno.puntosConducta,
      grupo:          v.alumno.inscripciones[0]?.grupo?.nombre || '—',
    }));

    res.json({ hijos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener hijos del tutor' });
  }
}

/**
 * GET /api/tutor/horario/:idAlumno
 */
async function getHorario(req, res) {
  const { idAlumno } = req.params;
  const idTutor      = req.usuario.id;

  try {
    // Verificar que el alumno pertenece al tutor
    const vinculo = await prisma.tutorAlumno.findFirst({
      where: { idTutor, idAlumno: parseInt(idAlumno) },
    });
    if (!vinculo) return res.status(403).json({ message: 'Acceso denegado' });

    const inscripcion = await prisma.inscripcion.findFirst({
      where: { idAlumno: parseInt(idAlumno), activa: true },
      include: {
        grupo: {
          include: {
            asignaciones: {
              where: { activa: true },
              include: {
                materia:  { select: { nombre: true } },
                personal: { select: { nombre: true } },
                horarios: true,
              },
            },
          },
        },
      },
    });

    const horario = {};
    if (inscripcion) {
      for (const asig of inscripcion.grupo.asignaciones) {
        for (const h of asig.horarios) {
          if (!horario[h.dia]) horario[h.dia] = {};
          horario[h.dia][h.numeroClase] = {
            mat:    asig.materia.nombre,
            salon:  h.salon,
            docente:asig.personal.nombre,
          };
        }
      }
    }

    res.json({ idAlumno, grupo: inscripcion?.grupo?.nombre, horario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener horario' });
  }
}

/**
 * GET /api/tutor/boleta/:idAlumno
 * Calificaciones + faltas por periodo.
 */
async function getBoleta(req, res) {
  const { idAlumno } = req.params;
  const idTutor      = req.usuario.id;

  try {
    const vinculo = await prisma.tutorAlumno.findFirst({
      where: { idTutor, idAlumno: parseInt(idAlumno) },
    });
    if (!vinculo) return res.status(403).json({ message: 'Acceso denegado' });

    const inscripcion = await prisma.inscripcion.findFirst({
      where: { idAlumno: parseInt(idAlumno), activa: true },
    });
    if (!inscripcion) return res.status(404).json({ message: 'Inscripción no encontrada' });

    const periodos = await prisma.periodoEvaluacion.findMany({
      orderBy: { fechaInicio: 'asc' },
    });

    const asignaciones = await prisma.asignacion.findMany({
      where: { grupo: { inscripciones: { some: { id: inscripcion.id } } } },
      include: {
        materia: { select: { nombre: true } },
        calificaciones: {
          where: { idInscripcion: inscripcion.id },
          select: { idPeriodoEvaluacion: true, calificacion: true },
        },
      },
    });

    const materias = asignaciones.map(a => ({
      materia: a.materia.nombre,
      calificaciones: periodos.map(p => {
        const cal = a.calificaciones.find(c => c.idPeriodoEvaluacion === p.id);
        return cal ? cal.calificacion : null;
      }),
    }));

    res.json({ idAlumno, periodos: periodos.map(p => p.nombre), materias });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener boleta' });
  }
}

/**
 * GET /api/tutor/reportes/:idAlumno
 */
async function getReportes(req, res) {
  const { idAlumno } = req.params;
  const idTutor      = req.usuario.id;

  try {
    const vinculo = await prisma.tutorAlumno.findFirst({
      where: { idTutor, idAlumno: parseInt(idAlumno) },
    });
    if (!vinculo) return res.status(403).json({ message: 'Acceso denegado' });

    const reportes = await prisma.reporte.findMany({
      where: { idAlumno: parseInt(idAlumno) },
      orderBy: { creadoEn: 'desc' },
      include: {
        usuarioReporta: { select: { nombre: true, rol: true } },
      },
    });

    res.json({ reportes, total: reportes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener reportes' });
  }
}

/**
 * GET /api/tutor/avisos
 */
async function getAvisos(req, res) {
  // Los avisos para el tutor los genera el sistema automáticamente.
  // Por ahora devuelve lista vacía hasta que Fase 5 los implemente.
  res.json({ avisos: [] });
}

module.exports = { getMisHijos, getHorario, getBoleta, getReportes, getAvisos };
