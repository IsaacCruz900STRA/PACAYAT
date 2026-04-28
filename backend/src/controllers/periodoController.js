const prisma = require('../config/db');

async function getPeriodoActivo(req, res) {
  try {
    const periodo = await prisma.periodoEscolar.findFirst({
      where: { activo: true },
      orderBy: { fechaInicio: 'desc' },
    });
    res.json(periodo);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener periodo activo' });
  }
}

async function getPeriodos(req, res) {
  try {
    const count = await prisma.periodoEvaluacion.count();
    if (count === 0) {
      await prisma.periodoEvaluacion.createMany({
        data: [
          { nombre: 'Parcial 1', fechaInicio: new Date('2025-09-01'), fechaFin: new Date('2025-11-15') },
          { nombre: 'Parcial 2', fechaInicio: new Date('2025-11-16'), fechaFin: new Date('2026-03-15') },
          { nombre: 'Parcial 3', fechaInicio: new Date('2026-03-16'), fechaFin: new Date('2026-07-15') },
        ],
      });
    }

    const periodos = await prisma.periodoEvaluacion.findMany({
      orderBy: { fechaInicio: 'asc' },
    });
    res.json({ periodos });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener periodos' });
  }
}

async function updatePeriodo(req, res) {
  const { id } = req.params;
  const { nombre, fechaInicio, fechaFin } = req.body;

  if (!nombre || !fechaInicio || !fechaFin) {
    return res.status(400).json({ message: 'Nombre, fecha inicio y fecha fin son obligatorios' });
  }

  if (new Date(fechaInicio) > new Date(fechaFin)) {
    return res.status(400).json({ message: 'La fecha de inicio no puede ser posterior a la fecha fin' });
  }

  try {
    const periodo = await prisma.periodoEvaluacion.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
      },
    });
    res.json(periodo);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar periodo' });
  }
}

module.exports = { getPeriodoActivo, getPeriodos, updatePeriodo };
