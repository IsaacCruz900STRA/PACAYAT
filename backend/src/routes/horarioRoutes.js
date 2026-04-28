// src/routes/horarioRoutes.js
const express   = require('express');
const router    = express.Router();
const auth      = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');

/**
 * GET /api/horarios/mi-horario
 * Devuelve el horario del docente autenticado.
 * TODO: implementar horarioController cuando se complete Fase 3.
 */
router.get('/mi-horario', auth, roleGuard(['DOCENTE']), async (req, res) => {
  // Placeholder — retorna mock hasta que se implemente el controller completo
  res.json({ horario: [], message: 'Horario próximamente disponible' });
});

module.exports = router;
