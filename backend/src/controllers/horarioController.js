const prisma = require('../config/db');
const { spawn } = require('child_process');
const path = require('path');
const { parsearPDF, normalizar } = require('../services/pdfHorarioParser');

// ── Constantes de mapeo ──────────────────────────────────────────────────────

const DIA_TO_ENUM = {
  'Lunes':     'LUNES',
  'Martes':    'MARTES',
  'Miércoles': 'MIERCOLES',
  'Jueves':    'JUEVES',
  'Viernes':   'VIERNES',
};

const ENUM_TO_DIA = {
  LUNES:    'Lunes',
  MARTES:   'Martes',
  MIERCOLES:'Miércoles',
  JUEVES:   'Jueves',
  VIERNES:  'Viernes',
};

// Slots 9 bloques de 50 min (receso 9:30-10:00 entre bloques 3 y 4)
const SLOTS = [
  { numero: 1, hora: '07:00-07:50' },
  { numero: 2, hora: '07:50-08:40' },
  { numero: 3, hora: '08:40-09:30' },
  { numero: 4, hora: '10:00-10:50' },
  { numero: 5, hora: '10:50-11:40' },
  { numero: 6, hora: '11:40-12:30' },
  { numero: 7, hora: '12:30-13:20' },
  { numero: 8, hora: '13:20-14:10' },
  { numero: 9, hora: '14:10-15:00' },
];

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

// ── Definición canónica: 9 bloques de 50 min, receso 9:30-10:00 ─────────────
const BLOQUES_DEF = [
  { numero: 1, inicio: '07:00', fin: '07:50', label: '07:00 - 07:50' },
  { numero: 2, inicio: '07:50', fin: '08:40', label: '07:50 - 08:40' },
  { numero: 3, inicio: '08:40', fin: '09:30', label: '08:40 - 09:30' },
  { numero: 4, inicio: '10:00', fin: '10:50', label: '10:00 - 10:50' },
  { numero: 5, inicio: '10:50', fin: '11:40', label: '10:50 - 11:40' },
  { numero: 6, inicio: '11:40', fin: '12:30', label: '11:40 - 12:30' },
  { numero: 7, inicio: '12:30', fin: '13:20', label: '12:30 - 13:20' },
  { numero: 8, inicio: '13:20', fin: '14:10', label: '13:20 - 14:10' },
  { numero: 9, inicio: '14:10', fin: '15:00', label: '14:10 - 15:00' },
];
const RECESO_DEF = { inicio: '09:30', fin: '10:00', label: 'RECESO' };
const DIAS_ENUM  = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];

// Construye grid vacío 5×6
function emptyGrid() {
  const grid = {};
  for (const e of DIAS_ENUM) {
    grid[ENUM_TO_DIA[e]] = {};
    for (const b of BLOQUES_DEF) grid[ENUM_TO_DIA[e]][b.numero] = null;
  }
  return grid;
}

// Rellena el grid con registros Horario de Prisma
function fillGrid(grid, horarios, modo) {
  for (const h of horarios) {
    const dia  = ENUM_TO_DIA[h.dia];
    const slot = h.numeroClase;
    if (!grid[dia] || slot < 1 || slot > 9) continue;
    grid[dia][slot] = modo === 'alumno'
      ? { idHorario: h.id, materia: h.asignacion.materia.nombre, docente: h.asignacion.docente?.nombre, salon: h.salon || '—' }
      : { idHorario: h.id, materia: h.asignacion.materia.nombre, grupo:   h.asignacion.grupo?.nombre,   salon: h.salon || '—' };
  }
  return grid;
}

// ── Helper: ejecutar el solver Python ────────────────────────────────────────

function runSolver(inputData) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../services/horario_solver.py');
    const proc = spawn('python', [scriptPath]);
    let stdout = '';
    let stderr = '';

    proc.stdin.write(JSON.stringify(inputData));
    proc.stdin.end();

    proc.stdout.on('data', chunk => { stdout += chunk.toString(); });
    proc.stderr.on('data', chunk => { stderr += chunk.toString(); });

    proc.on('close', code => {
      // Intentar parsear stdout sin importar el código de salida
      // (el script Python escribe JSON en stdout incluso en errores propios)
      if (stdout.trim()) {
        try {
          const parsed = JSON.parse(stdout);
          // Si el script reportó un error interno (ej. ortools no instalado)
          if (parsed.status === 'ERROR') {
            return reject(new Error(parsed.message || 'Error interno del solver'));
          }
          return resolve(parsed);
        } catch (_) {
          // No era JSON válido — caer al manejo de error genérico
        }
      }

      if (code !== 0) {
        const detalle = stderr.trim() || stdout.trim() || 'sin salida de error';
        return reject(new Error(
          `El solver Python terminó con error (código ${code}). Detalle: ${detalle}`
        ));
      }

      reject(new Error(`Respuesta vacía del solver. stderr: ${stderr}`));
    });

    proc.on('error', err => {
      if (err.code === 'ENOENT') {
        reject(new Error(
          'Python no encontrado en el PATH. ' +
          'Instala Python 3 desde https://python.org y marca "Add to PATH". ' +
          'Luego ejecuta: pip install ortools'
        ));
      } else {
        reject(err);
      }
    });
  });
}

// ── CRUD estándar de horarios ────────────────────────────────────────────────

async function getHorario(req, res) {
  const { idGrupo, idDocente } = req.query;
  const asignacionWhere = {};
  if (idGrupo)   asignacionWhere.idGrupo   = parseInt(idGrupo);
  if (idDocente) asignacionWhere.idDocente = parseInt(idDocente);

  try {
    const horarios = await prisma.horario.findMany({
      where: Object.keys(asignacionWhere).length ? { asignacion: asignacionWhere } : {},
      include: {
        asignacion: {
          include: {
            materia: { select: { nombre: true, grado: true } },
            docente: { select: { nombre: true } },
            grupo:   { select: { nombre: true } },
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
        numeroClase:  parseInt(numeroClase),
        salon:        salon?.trim() || null,
      },
    });
    res.status(201).json(horario);
  } catch (err) {
    if (err.code === 'P2002')
      return res.status(409).json({ message: 'Ya existe un horario en ese día y número de clase para esa asignación' });
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

// ── Consulta por alumno (obtiene horario del grupo al que pertenece) ─────────

async function getHorarioAlumno(req, res) {
  const { alumnoId } = req.params;
  try {
    const alumno = await prisma.alumno.findUnique({
      where:  { id: parseInt(alumnoId) },
      select: { idGrupo: true, nombreCompleto: true },
    });
    if (!alumno) return res.status(404).json({ message: 'Alumno no encontrado' });

    const horarios = await prisma.horario.findMany({
      where:   { asignacion: { idGrupo: alumno.idGrupo } },
      include: {
        asignacion: {
          include: {
            materia: { select: { nombre: true } },
            docente: { select: { nombre: true } },
            grupo:   { select: { nombre: true } },
          },
        },
      },
      orderBy: [{ dia: 'asc' }, { numeroClase: 'asc' }],
    });

    res.json({ horarios, alumno: { nombreCompleto: alumno.nombreCompleto } });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener horario del alumno' });
  }
}

// ── Generador automático con CP-SAT ─────────────────────────────────────────

async function generarHorario(req, res) {
  const { mockData, aulas, restricciones = {}, guardar = false, limpiarAnterior = false } = req.body;

  try {
    let inputData;

    /* ── Modo prueba: usar datos mock directamente ── */
    if (mockData) {
      // Las restricciones se añaden al input para que el solver las lea
      inputData = { ...mockData, restricciones };
    } else {
      /* ── Modo producción: construir desde la BD ── */
      if (!aulas || !Array.isArray(aulas) || aulas.length === 0) {
        return res.status(400).json({
          message: 'Debes proporcionar la lista de aulas disponibles para generar el horario.',
        });
      }

      const [asignaciones, grupos, docentes] = await Promise.all([
        prisma.asignacion.findMany({
          where: { activo: true },
          include: {
            docente: { select: { id: true, nombre: true } },
            materia: { select: { id: true, nombre: true } },
            grupo:   { select: { id: true, nombre: true } },
          },
        }),
        prisma.grupo.findMany({ select: { id: true, nombre: true } }),
        prisma.personal.findMany({
          where:  { rol: 'DOCENTE', activo: true },
          select: { id: true, nombre: true },
        }),
      ]);

      if (asignaciones.length === 0) {
        return res.status(400).json({
          message: 'No hay asignaciones activas en la base de datos para generar el horario.',
        });
      }

      const bloques = [];
      for (const dia of DIAS_SEMANA) {
        for (const slot of SLOTS) {
          bloques.push({
            id:       `${DIA_TO_ENUM[dia]}_${slot.numero}`,
            dia,
            hora:     slot.hora,
            numero:   slot.numero,
            dia_enum: DIA_TO_ENUM[dia],
          });
        }
      }

      const LABS_KEYWORDS = ['informática', 'cómputo', 'computo', 'computación', 'tecnología'];

      inputData = {
        bloques_tiempo:     bloques,
        aulas,
        restricciones,
        grupos:             grupos.map(g => ({ id: String(g.id), nombre: g.nombre })),
        profesores:         docentes.map(d => ({ id: String(d.id), nombre: d.nombre })),
        clases_por_asignar: asignaciones.map(a => {
          const nombreMin = a.materia.nombre.toLowerCase();
          const esLab = LABS_KEYWORDS.some(k => nombreMin.includes(k));
          return {
            id:          String(a.id),
            materia:     a.materia.nombre,
            profesor_id: String(a.idDocente),
            grupo_id:    String(a.idGrupo),
            tipo_aula:   esLab ? 'Laboratorio' : 'Regular',
          };
        }),
      };
    }

    /* ── Ejecutar solver ── */
    const resultado = await runSolver(inputData);

    if (resultado.status === 'INFEASIBLE' || resultado.status === 'ERROR') {
      return res.json({
        status:  resultado.status,
        message: resultado.message || 'No se pudo generar un horario válido.',
        horario: [],
      });
    }

    /* ── Guardar en BD (solo modo producción) ── */
    let guardado = false;
    if (guardar && !mockData) {
      const bloqueMap = {};
      for (const b of inputData.bloques_tiempo) {
        bloqueMap[b.id] = { dia_enum: b.dia_enum, numero: b.numero };
      }

      if (limpiarAnterior) {
        await prisma.horario.deleteMany({});
      }

      for (const h of resultado.horario) {
        const bloque = bloqueMap[h.bloque_id];
        if (!bloque) continue;

        await prisma.horario.upsert({
          where: {
            idAsignacion_dia_numeroClase: {
              idAsignacion: parseInt(h.clase_id),
              dia:          bloque.dia_enum,
              numeroClase:  bloque.numero,
            },
          },
          update: { salon: h.aula_nombre },
          create: {
            idAsignacion: parseInt(h.clase_id),
            dia:          bloque.dia_enum,
            numeroClase:  bloque.numero,
            salon:        h.aula_nombre,
          },
        });
      }
      guardado = true;
    }

    return res.json({
      status:       resultado.status,
      guardado,
      total_clases: resultado.horario.length,
      horario:      resultado.horario,
    });

  } catch (err) {
    console.error('[generarHorario]', err.message);
    res.status(500).json({ message: err.message || 'Error al ejecutar el generador de horarios' });
  }
}

// ── Guardar horario editado manualmente (desde drag & drop) ─────────────────

async function guardarHorarioManual(req, res) {
  const { assignments, limpiarAnterior = false } = req.body;

  if (!Array.isArray(assignments) || assignments.length === 0) {
    return res.status(400).json({ message: 'No hay asignaciones para guardar' });
  }

  // Verificar que todos los clase_id sean números válidos (no IDs mock como "C1")
  const mockIds = assignments.filter(a => isNaN(parseInt(a.clase_id)));
  if (mockIds.length > 0) {
    return res.status(400).json({
      message:
        'Este horario fue generado con datos de prueba (Mock) y no puede guardarse. ' +
        'Genera el horario en modo "Base de datos" para poder persistirlo.',
    });
  }

  try {
    if (limpiarAnterior) {
      await prisma.horario.deleteMany({});
    }

    let guardadas = 0;
    for (const a of assignments) {
      const diaEnum = DIA_TO_ENUM[a.dia];
      if (!diaEnum) continue;

      await prisma.horario.upsert({
        where: {
          idAsignacion_dia_numeroClase: {
            idAsignacion: parseInt(a.clase_id),
            dia:          diaEnum,
            numeroClase:  parseInt(a.slot),
          },
        },
        update: { salon: a.aula_nombre || null },
        create: {
          idAsignacion: parseInt(a.clase_id),
          dia:          diaEnum,
          numeroClase:  parseInt(a.slot),
          salon:        a.aula_nombre || null,
        },
      });
      guardadas++;
    }

    res.json({ message: `Horario guardado: ${guardadas} clases`, total: guardadas });
  } catch (err) {
    console.error('[guardarHorarioManual]', err.message);
    res.status(500).json({ message: 'Error al guardar el horario manual' });
  }
}

// ── Guardado por ID_GRUPO + CICLO_ESCOLAR ─────────────────────────────────────

async function guardarPorCiclo(req, res) {
  const { assignments, idGrupo, idPeriodoEscolar, limpiarAnterior = true } = req.body;

  if (!idPeriodoEscolar) {
    return res.status(400).json({ message: 'idPeriodoEscolar es obligatorio' });
  }
  if (!Array.isArray(assignments) || assignments.length === 0) {
    return res.status(400).json({ message: 'No hay asignaciones para guardar' });
  }

  const mockIds = assignments.filter(a => isNaN(parseInt(a.clase_id)));
  if (mockIds.length > 0) {
    return res.status(400).json({
      message: 'Los IDs de prueba (Mock) no pueden guardarse. Genera desde "Base de datos".',
    });
  }

  try {
    // Filtrar por grupo si se especificó
    let toSave = assignments;
    if (idGrupo) {
      const asigGrupo = await prisma.asignacion.findMany({
        where: { idGrupo: parseInt(idGrupo), activo: true },
        select: { id: true },
      });
      const asigIds = new Set(asigGrupo.map(a => String(a.id)));
      toSave = assignments.filter(a => asigIds.has(a.clase_id));
    }

    // Limpiar horarios previos para ese grupo+ciclo
    if (limpiarAnterior) {
      const whereClean = {
        idPeriodoEscolar: parseInt(idPeriodoEscolar),
        ...(idGrupo ? { asignacion: { idGrupo: parseInt(idGrupo) } } : {}),
      };
      await prisma.horario.deleteMany({ where: whereClean });
    }

    let guardadas = 0;
    for (const a of toSave) {
      const diaEnum = DIA_TO_ENUM[a.dia];
      if (!diaEnum) continue;

      await prisma.horario.upsert({
        where: {
          idAsignacion_dia_numeroClase: {
            idAsignacion: parseInt(a.clase_id),
            dia:          diaEnum,
            numeroClase:  parseInt(a.slot),
          },
        },
        update: { salon: a.aula_nombre || null, idPeriodoEscolar: parseInt(idPeriodoEscolar) },
        create: {
          idAsignacion:     parseInt(a.clase_id),
          idPeriodoEscolar: parseInt(idPeriodoEscolar),
          dia:              diaEnum,
          numeroClase:      parseInt(a.slot),
          salon:            a.aula_nombre || null,
        },
      });
      guardadas++;
    }

    // Info del ciclo guardado
    const ciclo = await prisma.periodoEscolar.findUnique({
      where: { id: parseInt(idPeriodoEscolar) },
    });

    res.json({
      message:         `Horario guardado: ${guardadas} clases para ${ciclo?.nombre || 'ciclo #' + idPeriodoEscolar}`,
      total:           guardadas,
      idGrupo:         idGrupo || null,
      idPeriodoEscolar: parseInt(idPeriodoEscolar),
      cicloEscolar:    ciclo,
    });
  } catch (err) {
    console.error('[guardarPorCiclo]', err.message);
    res.status(500).json({ message: 'Error al guardar el horario por ciclo' });
  }
}

// ── Grid 5×6 para un alumno ───────────────────────────────────────────────────

async function getHorarioAlumnoGrid(req, res) {
  const { alumnoId } = req.params;
  const { idPeriodoEscolar } = req.query;

  try {
    const alumno = await prisma.alumno.findUnique({
      where:   { id: parseInt(alumnoId) },
      include: { grupo: true },
    });
    if (!alumno) return res.status(404).json({ message: 'Alumno no encontrado' });

    const where = { asignacion: { idGrupo: alumno.idGrupo } };
    if (idPeriodoEscolar) where.idPeriodoEscolar = parseInt(idPeriodoEscolar);

    const horarios = await prisma.horario.findMany({
      where,
      include: {
        asignacion: {
          include: {
            materia: { select: { nombre: true } },
            docente: { select: { nombre: true } },
            grupo:   { select: { nombre: true } },
          },
        },
      },
      orderBy: [{ dia: 'asc' }, { numeroClase: 'asc' }],
    });

    const grid = fillGrid(emptyGrid(), horarios, 'alumno');

    let ciclo = null;
    if (idPeriodoEscolar) {
      ciclo = await prisma.periodoEscolar.findUnique({ where: { id: parseInt(idPeriodoEscolar) } });
    } else {
      ciclo = await prisma.periodoEscolar.findFirst({ where: { activo: true } });
    }

    res.json({
      alumno: {
        id:             alumno.id,
        nombreCompleto: alumno.nombreCompleto,
        matricula:      alumno.matricula,
        grupo:          alumno.grupo?.nombre || '—',
        idGrupo:        alumno.idGrupo,
      },
      cicloEscolar:  ciclo,
      bloques:       BLOQUES_DEF,
      receso:        RECESO_DEF,
      dias:          DIAS_SEMANA,
      grid,
      totalClases:   horarios.length,
    });
  } catch (err) {
    console.error('[getHorarioAlumnoGrid]', err.message);
    res.status(500).json({ message: 'Error al obtener horario del alumno' });
  }
}

// ── Grid 5×6 para un docente (agenda personal) ───────────────────────────────

async function _buildDocenteGrid(personalId, idPeriodoEscolar) {
  const docente = await prisma.personal.findUnique({
    where:  { id: parseInt(personalId) },
    select: { id: true, nombre: true, especialidad: true },
  });
  if (!docente) return null;

  const where = { asignacion: { idDocente: parseInt(personalId) } };
  if (idPeriodoEscolar) where.idPeriodoEscolar = parseInt(idPeriodoEscolar);

  const horarios = await prisma.horario.findMany({
    where,
    include: {
      asignacion: {
        include: {
          materia: { select: { nombre: true } },
          grupo:   { select: { nombre: true } },
        },
      },
    },
    orderBy: [{ dia: 'asc' }, { numeroClase: 'asc' }],
  });

  const grid  = fillGrid(emptyGrid(), horarios, 'docente');
  const grupos    = [...new Set(horarios.map(h => h.asignacion.grupo?.nombre).filter(Boolean))];
  const materias  = [...new Set(horarios.map(h => h.asignacion.materia?.nombre).filter(Boolean))];

  return {
    docente,
    bloques:  BLOQUES_DEF,
    receso:   RECESO_DEF,
    dias:     DIAS_SEMANA,
    grid,
    estadisticas: {
      totalClasesSemana: horarios.length,
      horasSemanalesMin: horarios.length * 50,
      totalGrupos:       grupos.length,
      grupos,
      materias,
    },
  };
}

async function getHorarioDocenteGrid(req, res) {
  try {
    const data = await _buildDocenteGrid(req.params.personalId, req.query.idPeriodoEscolar);
    if (!data) return res.status(404).json({ message: 'Docente no encontrado' });
    res.json(data);
  } catch (err) {
    console.error('[getHorarioDocenteGrid]', err.message);
    res.status(500).json({ message: 'Error al obtener agenda del docente' });
  }
}

// Agenda del docente autenticado
async function getMiAgendaDocente(req, res) {
  try {
    const personal = await prisma.personal.findFirst({ where: { idUsuario: req.usuario.id } });
    if (!personal) {
      return res.json({
        docente: null, bloques: BLOQUES_DEF, receso: RECESO_DEF,
        dias: DIAS_SEMANA, grid: emptyGrid(),
        estadisticas: { totalClasesSemana: 0, horasSemanalesMin: 0, totalGrupos: 0, grupos: [], materias: [] },
      });
    }
    const data = await _buildDocenteGrid(personal.id, req.query.idPeriodoEscolar);
    res.json(data);
  } catch (err) {
    console.error('[getMiAgendaDocente]', err.message);
    res.status(500).json({ message: 'Error al obtener agenda' });
  }
}

// ── Resumen del módulo de horarios ───────────────────────────────────────────

async function getResumen(req, res) {
  try {
    const [totalH, gruposConH, docentesConH, totalGrupos, totalDocentes] = await Promise.all([
      prisma.horario.count(),
      prisma.grupo.findMany({
        where:   { asignaciones: { some: { horarios: { some: {} } } } },
        select:  { id: true, nombre: true, grado: true },
        orderBy: [{ grado: 'asc' }, { nombre: 'asc' }],
      }),
      prisma.personal.findMany({
        where: {
          rol: 'DOCENTE', activo: true,
          asignaciones: { some: { horarios: { some: {} } } },
        },
        select:  { id: true, nombre: true },
        orderBy: { nombre: 'asc' },
      }),
      prisma.grupo.count(),
      prisma.personal.count({ where: { rol: 'DOCENTE', activo: true } }),
    ]);

    // Grupos sin horario
    const todosGrupos = await prisma.grupo.findMany({ select: { id: true, nombre: true, grado: true } });
    const idsConH = new Set(gruposConH.map(g => g.id));
    const sinHorario = todosGrupos.filter(g => !idsConH.has(g.id));

    const warnings = sinHorario.map(g => `Grupo ${g.nombre} sin horario asignado`);

    res.json({
      tieneHorario:             totalH > 0,
      totalHorarios:            totalH,
      totalGruposConHorario:    gruposConH.length,
      totalDocentesConHorario:  docentesConH.length,
      totalGrupos,
      totalDocentes,
      gruposConHorario:         gruposConH,
      docentesConHorario:       docentesConH,
      warnings,
    });
  } catch (err) {
    console.error('[getResumen]', err.message);
    res.status(500).json({ message: 'Error al obtener resumen del módulo de horarios' });
  }
}

// ── Importar PDF de aSc Horarios ─────────────────────────────────────────────

async function importarPDF(req, res) {
  if (!req.file) return res.status(400).json({ message: 'No se recibió ningún archivo PDF' });

  try {
    const grupos = await parsearPDF(req.file.buffer);

    if (!grupos.length) {
      return res.status(422).json({ message: 'No se encontraron horarios en el PDF. Verifica que sea un archivo generado por aSc Horarios.' });
    }

    // Cargar asignaciones de la BD para intentar hacer match
    const asignaciones = await prisma.asignacion.findMany({
      where: { activo: true },
      include: {
        grupo:   { select: { id: true, nombre: true } },
        materia: { select: { id: true, nombre: true } },
        docente: { select: { id: true, nombre: true } },
      },
    });

    // Índice para búsqueda rápida: grupoNombre → asignaciones
    const asigPorGrupo = {};
    for (const a of asignaciones) {
      const g = a.grupo.nombre;
      if (!asigPorGrupo[g]) asigPorGrupo[g] = [];
      asigPorGrupo[g].push(a);
    }

    // Para cada grupo/celda intentar encontrar idAsignacion
    const resultado = grupos.map(({ nombre, grid }) => {
      const asigGrupo = asigPorGrupo[nombre] || [];
      const gridEnriquecido = {};

      for (const [dia, slots] of Object.entries(grid)) {
        gridEnriquecido[dia] = {};
        for (const [slot, celda] of Object.entries(slots)) {
          if (!celda) { gridEnriquecido[dia][slot] = null; continue; }

          // Usar la misma función robusta de resolución
          const asig = resolverAsignacion(celda, asigGrupo);

          gridEnriquecido[dia][slot] = {
            ...celda,
            idAsignacion:    asig?.id ?? null,
            idGrupoSugerido: asig?.grupo.id ?? null,
          };
        }
      }

      const idGrupo = asigGrupo[0]?.grupo.id ?? null;
      return { nombre, idGrupo, grid: gridEnriquecido };
    });

    // Cargar lista de docentes y materias para que el front pueda mostrar selectores
    const [docentes, materias] = await Promise.all([
      prisma.personal.findMany({ where: { rol: 'DOCENTE', activo: true }, select: { id: true, nombre: true } }),
      prisma.materia.findMany({ select: { id: true, nombre: true, grado: true } }),
    ]);

    res.json({ grupos: resultado, docentes, materias });
  } catch (err) {
    console.error('[importarPDF]', err.message);
    res.status(500).json({ message: 'Error al procesar el PDF: ' + err.message });
  }
}

const DIAS_ENUM_MAP = { Lu:'LUNES', Ma:'MARTES', Mi:'MIERCOLES', Ju:'JUEVES', Vi:'VIERNES' };

function esNombreDocente(texto = '') {
  return /^PROF(R|RA)?\.?\s/i.test(texto.trim()) || /^DR[A]?\.?\s/i.test(texto.trim());
}

// Normaliza texto: quita acentos (rango explícito ̀-ͯ), minúsculas,
// elimina puntuación, colapsa espacios. Robusto ante distintas codificaciones.
function normN(str = '') {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // elimina diacríticos combinantes
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')       // elimina puntuación y caracteres especiales
    .replace(/\s+/g, ' ')
    .trim();
}

// Compara dos nombres: retorna puntuación 0-3 (mayor = mejor match)
function scoreNombre(a, b) {
  const na = normN(a), nb = normN(b);
  if (!na || !nb) return 0;
  if (na === nb) return 3;                    // exacto
  if (na.includes(nb) || nb.includes(na)) return 2;  // uno contiene al otro
  // Prefijo (primeras 5 letras comunes)
  const pfx = Math.min(5, na.length, nb.length);
  if (pfx >= 4 && na.slice(0, pfx) === nb.slice(0, pfx)) return 1;
  return 0;
}

// Busca la mejor asignación para una celda del PDF dentro de un grupo
function resolverAsignacion(celda, asigGrupo) {
  if (!celda?.materia || esNombreDocente(celda.materia)) return null;

  const resultados = asigGrupo.map(a => {
    const scoreM = scoreNombre(celda.materia, a.materia.nombre);
    const scoreD = celda.docente ? scoreNombre(celda.docente, a.docente.nombre) : 0;
    return { a, scoreM, scoreD, total: scoreM * 10 + scoreD };
  }).filter(r => r.scoreM > 0 || r.scoreD > 0);

  if (!resultados.length) return null;
  resultados.sort((x, y) => y.total - x.total);

  // Necesitamos al menos match en materia
  return resultados[0].scoreM > 0 ? resultados[0].a : null;
}

// ── Guardar horario importado (después de revisión en el front) ───────────────

async function guardarImportados(req, res) {
  // limpiarTodo = borrar TODOS los horarios de la BD antes de guardar (clean slate)
  const { grupos, idPeriodoEscolar, limpiarGrupos = false, limpiarTodo = false } = req.body;

  if (!Array.isArray(grupos) || !grupos.length) {
    return res.status(400).json({ message: 'No hay datos para guardar' });
  }

  // Cargar todo de la BD una sola vez para evitar N+1 queries
  const [gruposBD, asignacionesBD] = await Promise.all([
    prisma.grupo.findMany({ select: { id: true, nombre: true } }),
    prisma.asignacion.findMany({
      where: { activo: true },
      include: {
        grupo:   { select: { id: true, nombre: true } },
        materia: { select: { id: true, nombre: true } },
        docente: { select: { id: true, nombre: true } },
      },
    }),
  ]);

  const grupoPorNombre = Object.fromEntries(gruposBD.map(g => [g.nombre, g.id]));

  // Índice asignaciones por idGrupo
  const asigPorGrupoId = {};
  for (const a of asignacionesBD) {
    if (!asigPorGrupoId[a.idGrupo]) asigPorGrupoId[a.idGrupo] = [];
    asigPorGrupoId[a.idGrupo].push(a);
  }

  let totalGuardadas = 0;
  const errores = [];
  const periodoId = idPeriodoEscolar ? parseInt(idPeriodoEscolar) : null;

  // Limpiar TODOS los horarios de la BD antes de guardar
  if (limpiarTodo) {
    await prisma.horario.deleteMany({});
  }

  for (const grupo of grupos) {
    const { nombre, grid } = grupo;

    // Resolver idGrupo: del front o por nombre en BD
    const idGrupoRaw = grupo.idGrupo;
    const idGrupo    = (idGrupoRaw && !isNaN(parseInt(idGrupoRaw)))
      ? parseInt(idGrupoRaw)
      : (grupoPorNombre[nombre] ?? null);

    if (!idGrupo) {
      errores.push(`Grupo "${nombre}" no encontrado — ejecuta el seed con los datos actualizados`);
      continue;
    }

    // Borrar horarios del grupo si se pide limpiar por grupo (y no se hizo limpiarTodo)
    if (limpiarGrupos && !limpiarTodo) {
      await prisma.horario.deleteMany({ where: { asignacion: { idGrupo } } });
    }

    const asigGrupo = asigPorGrupoId[idGrupo] || [];

    for (const [diaAbr, slots] of Object.entries(grid)) {
      const diaEnum = DIAS_ENUM_MAP[diaAbr];
      if (!diaEnum) continue;

      for (const [slotStr, celda] of Object.entries(slots)) {
        if (!celda?.materia) continue;
        if (esNombreDocente(celda.materia)) continue;

        const slot = parseInt(slotStr);
        const asig = resolverAsignacion(celda, asigGrupo);

        if (!asig) {
          errores.push(`${nombre} ${diaAbr} B${slot}: sin asignación para "${celda.materia}"`);
          continue;
        }
        const idAsignacion = asig.id;

        try {
          await prisma.horario.upsert({
            where: { idAsignacion_dia_numeroClase: { idAsignacion, dia: diaEnum, numeroClase: slot } },
            update: { salon: celda.salon || null, ...(periodoId ? { idPeriodoEscolar: periodoId } : {}) },
            create: {
              idAsignacion, dia: diaEnum, numeroClase: slot,
              salon: celda.salon || null,
              ...(periodoId ? { idPeriodoEscolar: periodoId } : {}),
            },
          });
          totalGuardadas++;
        } catch (e) {
          errores.push(`${nombre} ${diaAbr} bloque ${slot}: ${e.message}`);
        }
      }
    }
  }

  res.json({
    message: `Horario guardado: ${totalGuardadas} bloques en ${grupos.length} grupos`,
    total:   totalGuardadas,
    errores: errores.length ? errores.slice(0, 30) : undefined,
    grupos:  grupos.length,
  });
}

module.exports = {
  getHorario,
  createHorario,
  deleteHorario,
  getHorarioAlumno,
  generarHorario,
  guardarHorarioManual,
  guardarPorCiclo,
  getHorarioAlumnoGrid,
  getHorarioDocenteGrid,
  getMiAgendaDocente,
  getResumen,
  importarPDF,
  guardarImportados,
};
