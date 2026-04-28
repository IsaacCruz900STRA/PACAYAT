const express   = require('express');
const router    = express.Router();
const auth      = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');
const prisma    = require('../config/db');
const ctrl      = require('../controllers/horarioController');

// Horario personal del docente autenticado
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

// CRUD general de horarios
router.get('/', auth, ctrl.getHorario);
router.post('/', auth, roleGuard(['ADMIN', 'SECRETARIA', 'CONTROL_ESCOLAR']), ctrl.createHorario);
router.delete('/:id', auth, roleGuard(['ADMIN', 'SECRETARIA', 'CONTROL_ESCOLAR']), ctrl.deleteHorario);

module.exports = router;
