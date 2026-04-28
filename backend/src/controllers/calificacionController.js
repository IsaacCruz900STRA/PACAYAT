// src/controllers/calificacionController.js
const prisma = require('../config/db');

/**
 * GET /api/calificaciones/mis-grupos
 * Devuelve los grupos y materias asignados al docente autenticado
 * en el periodo escolar activo.
 */
async function getMisGrupos(req, res) {
  const idDocente = req.usuario.id;
  try {
    const asignaciones = await prisma.asignacion.findMany({
      where: {
        idPersonal: idDocente,
        activa: true,
      },
      include: {
        materia: { select: { id: true, nombre: true } },
        grupo:   { select: { id: true, nombre: true } },
      },
      orderBy: { grupo: { nombre: 'asc' } },
    });

    const data = asignaciones.map(a => ({
      idAsignacion: a.id,
      grupo:        a.grupo.nombre,
      idGrupo:      a.grupo.id,
      materia:      a.materia.nombre,
      idMateria:    a.materia.id,
    }));

    res.json({ grupos: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener grupos del docente' });
  }
}

/**
 * GET /api/calificaciones
 * Query: { idAsignacion, idPeriodo }
 *
 * Devuelve alumnos del grupo con sus calificaciones para ese periodo.
 */
async function getCalificacionesGrupo(req, res) {
  const { idAsignacion, idPeriodo } = req.query;

  if (!idAsignacion || !idPeriodo) {
    return res.status(400).json({ message: 'Se requiere idAsignacion e idPeriodo' });
  }

  try {
    // Verificar que el docente tiene acceso a esta asignación
    const asignacion = await prisma.asignacion.findFirst({
      where: {
        id: parseInt(idAsignacion),
        ...(req.usuario.rol === 'DOCENTE' ? { idPersonal: req.usuario.id } : {}),
      },
      include: {
        grupo: {
          include: {
            inscripciones: {
              where: { activa: true },
              include: { alumno: { select: { id: true, nombreCompleto: true, matricula: true } } },
              orderBy: { alumno: { nombreCompleto: 'asc' } },
            },
          },
        },
      },
    });

    if (!asignacion) {
      return res.status(403).json({ message: 'No tienes acceso a esta asignación' });
    }

    // Obtener calificaciones ya capturadas para ese periodo
    const calCapturadas = await prisma.calificacion.findMany({
      where: {
        idAsignacion: parseInt(idAsignacion),
        idPeriodoEvaluacion: parseInt(idPeriodo),
      },
      select: { idInscripcion: true, calificacion: true },
    });

    const calMap = {};
    calCapturadas.forEach(c => { calMap[c.idInscripcion] = c.calificacion; });

    const alumnos = asignacion.grupo.inscripciones.map(ins => ({
      id:             ins.alumno.id,
      idInscripcion:  ins.id,
      nombreCompleto: ins.alumno.nombreCompleto,
      matricula:      ins.alumno.matricula,
      calificacion:   calMap[ins.id] ?? null,
    }));

    res.json({
      idAsignacion: parseInt(idAsignacion),
      idPeriodo:    parseInt(idPeriodo),
      grupo:        asignacion.grupo.nombre,
      alumnos,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener calificaciones' });
  }
}

/**
 * POST /api/calificaciones/masivo
 * Body: [{ idAlumno, idInscripcion, idAsignacion, idPeriodoEvaluacion, calificacion }]
 *
 * Reglas:
 *  · Solo el DOCENTE dueño de la asignación puede guardar.
 *  · Solo si el periodo está ACTIVO.
 *  · ADMIN puede guardar en cualquier estado.
 *  · Hace UPSERT (crea o actualiza).
 */
async function guardarCalificacionesMasivo(req, res) {
  const registros = req.body;
  const { rol, id: idUsuario } = req.usuario;

  if (!Array.isArray(registros) || registros.length === 0) {
    return res.status(400).json({ message: 'Se requiere un array de calificaciones' });
  }

  // Validar rango de calificaciones
  for (const r of registros) {
    if (r.calificacion < 0 || r.calificacion > 10) {
      return res.status(400).json({ message: `Calificación fuera de rango (0-10): ${r.calificacion}` });
    }
  }

  try {
    // Verificar periodo activo (salvo ADMIN)
    const idPeriodo = registros[0].idPeriodoEvaluacion;
    const periodo   = await prisma.periodoEvaluacion.findUnique({
      where: { id: parseInt(idPeriodo) },
    });

    if (!periodo) {
      return res.status(404).json({ message: 'Periodo no encontrado' });
    }
    if (rol !== 'ADMIN' && periodo.estado !== 'ACTIVO') {
      return res.status(403).json({
        message: `El periodo "${periodo.nombre}" no está activo. Solo puedes capturar en el periodo activo.`,
      });
    }

    // Si es DOCENTE, verificar que la asignación le pertenece
    if (rol === 'DOCENTE') {
      const idAsignacion = registros[0].idAsignacion;
      const asignacion   = await prisma.asignacion.findFirst({
        where: { id: parseInt(idAsignacion), idPersonal: idUsuario },
      });
      if (!asignacion) {
        return res.status(403).json({ message: 'No tienes permiso para modificar estas calificaciones' });
      }
    }

    // UPSERT en transacción
    const resultados = await prisma.$transaction(
      registros.map(r =>
        prisma.calificacion.upsert({
          where: {
            idInscripcion_idAsignacion_idPeriodoEvaluacion: {
              idInscripcion:       r.idInscripcion,
              idAsignacion:        r.idAsignacion,
              idPeriodoEvaluacion: r.idPeriodoEvaluacion,
            },
          },
          update: { calificacion: r.calificacion, actualizadoEn: new Date() },
          create: {
            idInscripcion:       r.idInscripcion,
            idAsignacion:        r.idAsignacion,
            idPeriodoEvaluacion: r.idPeriodoEvaluacion,
            calificacion:        r.calificacion,
          },
        })
      )
    );

    res.json({ guardados: resultados.length, message: 'Calificaciones guardadas correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al guardar calificaciones' });
  }
}

module.exports = { getMisGrupos, getCalificacionesGrupo, guardarCalificacionesMasivo };
