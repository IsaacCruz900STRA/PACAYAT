const express      = require('express');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Rutas
const authRoutes         = require('./routes/authRoutes');
const alumnoRoutes       = require('./routes/alumnoRoutes');
const reporteRoutes      = require('./routes/reporteRoutes');
const calificacionRoutes = require('./routes/calificacionRoutes');
const asistenciaRoutes   = require('./routes/asistenciaRoutes');
const avisoRoutes        = require('./routes/avisoRoutes');
const horarioRoutes      = require('./routes/horarioRoutes');
const inscripcionRoutes  = require('./routes/inscripcionRoutes');
const personalRoutes     = require('./routes/personalRoutes');
const tutorRoutes        = require('./routes/tutorRoutes');
const usuarioRoutes      = require('./routes/usuarioRoutes');
const periodoRoutes      = require('./routes/periodoRoutes');
const materiaRoutes      = require('./routes/materiaRoutes');
const grupoRoutes        = require('./routes/grupoRoutes');
const archivoRoutes      = require('./routes/archivoRoutes');

const app = express();

// ── Middlewares globales ─────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // necesario para que el navegador envíe cookies
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Archivos estáticos (uploads)
app.use('/uploads', express.static('uploads'));

// ── Rutas API ────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/alumnos',       alumnoRoutes);
app.use('/api/reportes',      reporteRoutes);
app.use('/api/calificaciones',calificacionRoutes);
app.use('/api/asistencia',    asistenciaRoutes);
app.use('/api/avisos',        avisoRoutes);
app.use('/api/horarios',      horarioRoutes);
app.use('/api/inscripciones', inscripcionRoutes);
app.use('/api/personal',      personalRoutes);
app.use('/api/tutores',       tutorRoutes);
app.use('/api/usuarios',      usuarioRoutes);
app.use('/api/periodos',      periodoRoutes);
app.use('/api/materias',      materiaRoutes);
app.use('/api/grupos',        grupoRoutes);
app.use('/api/archivos',      archivoRoutes);

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── Manejo de errores global ──────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor PACAYAT corriendo en http://localhost:${PORT}`);
});
