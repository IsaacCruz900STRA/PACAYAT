const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { globalLimiter, authLimiter } = require('./middlewares/rateLimiter');
const staticAuth = require('./middlewares/staticAuth');

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

// ── Cabeceras de seguridad HTTP (helmet) ─────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'"],
      styleSrc:    ["'self'", "'unsafe-inline'"],
      imgSrc:      ["'self'", 'data:', 'blob:'],
      connectSrc:  ["'self'"],
      fontSrc:     ["'self'"],
      objectSrc:   ["'none'"],
      frameSrc:    ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// ── CORS ─────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// ── Parsers ───────────────────────────────────────────────────
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Rate limiting global ──────────────────────────────────────
app.use(globalLimiter);

// ── Archivos estáticos — requieren sesión válida ──────────────
app.use('/uploads', staticAuth, express.static('uploads'));

// ── Rutas API ────────────────────────────────────────────────
app.use('/api/auth',          authLimiter, authRoutes);
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

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── Manejo de errores global ──────────────────────────────────
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
