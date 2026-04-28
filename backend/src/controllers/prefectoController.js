// src/controllers/prefectoController.js
const prisma = require('../config/db');

/**
 * GET /api/prefecto/buscar?q=texto&tipo=alumno|docente|todos
 * Buscador unificado para la vista de horarios.
 */
async function buscar(req, res) {
  const { q = '', tipo = 'todos' } = req.query;
  if (q.length < 2) return res.json([]);

  const resultados = [];

  try {
    if (tipo === 'todos' || tipo === 'alumno') {
      const alumnos = await prisma.alumno.findMany({
        where: {
          activo: true,
          OR: [
            { nombreCompleto: { contains: q, mode: 'insensitive' } },
            { matricula:      { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 6,
        select: {
          id: true, nombreCompleto: true, matricula: true,
          inscripciones: { where: { activa: true }, select: { grupo: { select: { nombre: true } } }, take: 1 },
        },
      });
      alumnos.forEach(a => resultados.push({
        id:        a.id,
        tipo:      'alumno',
        nombre:    a.nombreCompleto,
        matricula: a.matricula,
        grupo:     a.inscripciones[0]?.grupo?.nombre || '—',
      }));
    }

    if (tipo === 'todos' || tipo === 'docente') {
      const personal = await prisma.personal.findMany({
        where: {
          activo: true,
          rol: 'DOCENTE',
          nombre: { contains: q, mode: 'insensitive' },
        },
        take: 6,
        select: {
          id: true, nombre: true,
          asignaciones: {
            where: { activa: true },
            select: { materia: { select: { nombre: true } } },
            take: 1,
          },
        },
      });
      personal.forEach(p => resultados.push({
        id:      p.id,
        tipo:    'docente',
        nombre:  p.nombre,
        materia: p.asignaciones[0]?.materia?.nombre || 'Docente',
      }));
    }

    res.json(resultados);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en la búsqueda' });
  }
}

/**
 * GET /api/prefecto/horario/alumno/:idAlumno
 */
async function getHorarioAlumno(req, res) {
  const { idAlumno } = req.params;
  try {
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
    if (!inscripcion) return res.status(404).json({ message: 'Inscripción activa no encontrada' });

    // Transformar a formato { dia: { claseId: { mat, salon } } }
    const horario = {};
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
    res.json({ alumno: { id: idAlumno }, grupo: inscripcion.grupo.nombre, horario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener horario del alumno' });
  }
}

/**
 * GET /api/prefecto/horario/docente/:idPersonal
 */
async function getHorarioDocente(req, res) {
  const { idPersonal } = req.params;
  try {
    const asignaciones = await prisma.asignacion.findMany({
      where: { idPersonal: parseInt(idPersonal), activa: true },
      include: {
        materia: { select: { nombre: true } },
        grupo:   { select: { nombre: true } },
        horarios: true,
      },
    });

    const horario = {};
    for (const asig of asignaciones) {
      for (const h of asig.horarios) {
        if (!horario[h.dia]) horario[h.dia] = {};
        horario[h.dia][h.numeroClase] = {
          mat:   asig.materia.nombre,
          grupo: asig.grupo.nombre,
          salon: h.salon,
        };
      }
    }
    res.json({ idPersonal, horario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener horario del docente' });
  }
}

/**
 * GET /api/prefecto/reportes/:idAlumno?tipo=Positivo|Negativo
 */
async function getReportesAlumno(req, res) {
  const { idAlumno } = req.params;
  const { tipo = '' } = req.query;

  try {
    const reportes = await prisma.reporte.findMany({
      where: {
        idAlumno: parseInt(idAlumno),
        ...(tipo ? { tipo: tipo.toUpperCase() } : {}),
      },
      orderBy: { creadoEn: 'desc' },
      include: {
        alumno:         { select: { nombreCompleto: true, puntosConducta: true } },
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
 * GET /api/prefecto/dashboard
 */
async function getDashboard(req, res) {
  try {
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const lunesEstaSemana = new Date(hoy);
    lunesEstaSemana.setDate(hoy.getDate() - hoy.getDay() + 1);

    const [reportesHoy, reportesSemana, enRiesgo] = await Promise.all([
      prisma.reporte.count({ where: { creadoEn: { gte: hoy } } }),
      prisma.reporte.count({ where: { creadoEn: { gte: lunesEstaSemana } } }),
      prisma.alumno.count({ where: { puntosConducta: { lt: 60 }, activo: true } }),
    ]);

    res.json({ reportesHoy, reportesSemana, enRiesgo });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
}

module.exports = { buscar, getHorarioAlumno, getHorarioDocente, getReportesAlumno, getDashboard };
