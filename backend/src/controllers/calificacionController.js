const prisma = require('../config/db');

// ── Para admin/expediente: calificaciones de un alumno ───────────────────────
async function getCalificaciones(req, res) {
  const { idAlumno } = req.query;
  const where = idAlumno ? { inscripcion: { idAlumno: parseInt(idAlumno) } } : {};
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
            grupo:   { select: { nombre: true } },
          },
        },
      },
    });
    const data = calificaciones.map(c => ({
      id:           c.id,
      calificacion: c.calificacion,
      periodo:      c.periodo?.nombre     || '—',
      materia:      c.asignacion?.materia?.nombre || '—',
      clave:        c.asignacion?.materia?.clave  || '',
      docente:      c.asignacion?.docente?.nombre || '—',
      grupo:        c.asignacion?.grupo?.nombre   || '—',
      actualizadoEn: c.actualizadoEn,
    }));
    res.json({ calificaciones: data, total: data.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener calificaciones' });
  }
}

// ── Para docente: grupos y materias asignados ────────────────────────────────
async function getMisGrupos(req, res) {
  try {
    // req.usuario.id es el id de Usuario; necesitamos el id de Personal
    const personal = await prisma.personal.findFirst({ where: { idUsuario: req.usuario.id } });
    if (!personal) return res.status(404).json({ message: 'Perfil de docente no encontrado' });

    const asignaciones = await prisma.asignacion.findMany({
      where: { idDocente: personal.id, activo: true },
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

// ── Para docente: alumnos + calificaciones de un grupo/periodo ───────────────
async function getCalificacionesGrupo(req, res) {
  const { idAsignacion, idPeriodo } = req.query;
  if (!idAsignacion || !idPeriodo) {
    return res.status(400).json({ message: 'Se requiere idAsignacion e idPeriodo' });
  }
  try {
    let docenteWhere = {};
    if (req.usuario.rol === 'DOCENTE') {
      const personal = await prisma.personal.findFirst({ where: { idUsuario: req.usuario.id } });
      if (!personal) return res.status(403).json({ message: 'Perfil de docente no encontrado' });
      docenteWhere = { idDocente: personal.id };
    }

    const asignacion = await prisma.asignacion.findFirst({
      where: { id: parseInt(idAsignacion), ...docenteWhere },
      include: {
        grupo: {
          select: {
            nombre: true,
            inscripciones: {
              where: { activa: true },
              include: { alumno: { select: { id: true, nombreCompleto: true, matricula: true } } },
              orderBy: { alumno: { nombreCompleto: 'asc' } },
            },
          },
        },
      },
    });

    if (!asignacion) return res.status(403).json({ message: 'No tienes acceso a esta asignación' });

    const calCapturadas = await prisma.calificacion.findMany({
      where: { idAsignacion: parseInt(idAsignacion), idPeriodo: parseInt(idPeriodo) },
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

    res.json({ idAsignacion: parseInt(idAsignacion), idPeriodo: parseInt(idPeriodo), grupo: asignacion.grupo.nombre, alumnos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener calificaciones del grupo' });
  }
}

// ── Upsert individual (admin/secretaria) ─────────────────────────────────────
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
          idAsignacion:  parseInt(idAsignacion),
          idPeriodo:     parseInt(idPeriodo),
        },
      },
      update: { calificacion: valor },
      create: {
        idInscripcion: parseInt(idInscripcion),
        idAsignacion:  parseInt(idAsignacion),
        idPeriodo:     parseInt(idPeriodo),
        calificacion:  valor,
      },
    });
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al guardar calificación' });
  }
}

// ── Guardar en bloque (docente) ───────────────────────────────────────────────
async function guardarCalificacionesMasivo(req, res) {
  const registros = req.body;
  if (!Array.isArray(registros) || registros.length === 0) {
    return res.status(400).json({ message: 'Se requiere un array de calificaciones' });
  }
  for (const r of registros) {
    const v = parseFloat(r.calificacion);
    if (isNaN(v) || v < 0 || v > 10) {
      return res.status(400).json({ message: `Calificación fuera de rango (0-10): ${r.calificacion}` });
    }
  }
  try {
    const resultados = await prisma.$transaction(
      registros.map(r =>
        prisma.calificacion.upsert({
          where: {
            idInscripcion_idAsignacion_idPeriodo: {
              idInscripcion: parseInt(r.idInscripcion),
              idAsignacion:  parseInt(r.idAsignacion),
              idPeriodo:     parseInt(r.idPeriodo),
            },
          },
          update: { calificacion: parseFloat(r.calificacion) },
          create: {
            idInscripcion: parseInt(r.idInscripcion),
            idAsignacion:  parseInt(r.idAsignacion),
            idPeriodo:     parseInt(r.idPeriodo),
            calificacion:  parseFloat(r.calificacion),
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

module.exports = {
  getCalificaciones,
  getMisGrupos,
  getCalificacionesGrupo,
  upsertCalificacion,
  guardarCalificacionesMasivo,
};
