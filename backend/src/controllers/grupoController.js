const prisma = require('../config/db');

async function getGrupos(req, res) {
  try {
    const grupos = await prisma.grupo.findMany({
      orderBy: [{ grado: 'asc' }, { seccion: 'asc' }],
    });
    res.json({ grupos });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener grupos' });
  }
}

async function createGrupo(req, res) {
  const { nombre, grado, seccion } = req.body;
  if (!nombre || !grado || !seccion) {
    return res.status(400).json({ message: 'nombre, grado y seccion son obligatorios' });
  }
  try {
    const grupo = await prisma.grupo.create({
      data: { nombre: nombre.trim(), grado: parseInt(grado), seccion: seccion.trim().toUpperCase() },
    });
    res.status(201).json(grupo);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'Ya existe un grupo con ese nombre' });
    res.status(500).json({ message: 'Error al crear grupo' });
  }
}

async function deleteGrupo(req, res) {
  const { id } = req.params;
  try {
    const tiene = await prisma.alumno.count({ where: { idGrupo: parseInt(id) } });
    if (tiene > 0) return res.status(409).json({ message: 'No se puede eliminar un grupo con alumnos asignados' });
    await prisma.grupo.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Grupo eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar grupo' });
  }
}

module.exports = { getGrupos, createGrupo, deleteGrupo };
