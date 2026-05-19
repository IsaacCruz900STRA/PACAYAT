const express   = require('express');
const router    = express.Router();
const multer    = require('multer');
const auth      = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');
const prisma    = require('../config/db');
const ctrl      = require('../controllers/horarioController');

const uploadPDF = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_, file, cb) => {
    cb(null, file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf'));
  },
});

// ── Importación desde PDF de aSc Horarios ────────────────────────────────────
router.post('/importar-pdf',     auth, roleGuard(['ADMIN', 'DIRECTIVO']), uploadPDF.single('pdf'), ctrl.importarPDF);
router.post('/guardar-importados', auth, roleGuard(['ADMIN', 'DIRECTIVO']), ctrl.guardarImportados);

// ── Generador automático (CP-SAT) ────────────────────────────────────────────
router.post('/generar',  auth, roleGuard(['ADMIN', 'DIRECTIVO']), ctrl.generarHorario);

// ── Guardado drag & drop genérico ────────────────────────────────────────────
router.post('/guardar',  auth, roleGuard(['ADMIN', 'DIRECTIVO']), ctrl.guardarHorarioManual);

// ── Guardado vinculado a ID_GRUPO + CICLO_ESCOLAR ────────────────────────────
router.post('/guardar-ciclo', auth, roleGuard(['ADMIN', 'DIRECTIVO']), ctrl.guardarPorCiclo);

// ── Grid 5×6 para alumno (5 días × 6 bloques de 50 min) ─────────────────────
router.get('/alumno-grid/:alumnoId', auth, ctrl.getHorarioAlumnoGrid);

// ── Grid 5×6 para docente específico ────────────────────────────────────────
router.get('/docente-grid/:personalId', auth, ctrl.getHorarioDocenteGrid);

// ── Agenda personal del docente autenticado (grid 5×6) ──────────────────────
router.get('/mi-agenda', auth, roleGuard(['DOCENTE']), ctrl.getMiAgendaDocente);

// ── Horario del alumno (formato array, legado) ───────────────────────────────
router.get('/alumno/:alumnoId', auth, ctrl.getHorarioAlumno);

// ── Horario personal del docente autenticado (formato array, legado) ─────────
router.get('/mi-horario', auth, roleGuard(['DOCENTE']), async (req, res) => {
  try {
    const personal = await prisma.personal.findFirst({ where: { idUsuario: req.usuario.id } });
    if (!personal) return res.json({ horarios: [] });
    req.query = { ...req.query, idDocente: personal.id };
    return ctrl.getHorario(req, res);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener horario del docente' });
  }
});

// ── Resumen del módulo (tieneHorario, grupos/docentes con horario) ────────────
router.get('/resumen', auth, ctrl.getResumen);

// ── CRUD general de horarios ─────────────────────────────────────────────────
router.get('/',       auth, ctrl.getHorario);
router.post('/',      auth, roleGuard(['ADMIN', 'SECRETARIA', 'CONTROL_ESCOLAR']), ctrl.createHorario);
router.delete('/:id', auth, roleGuard(['ADMIN', 'SECRETARIA', 'CONTROL_ESCOLAR']), ctrl.deleteHorario);

module.exports = router;
