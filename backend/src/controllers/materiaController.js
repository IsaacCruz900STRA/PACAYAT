const prisma = require('../config/db');

const MATERIAS_BASE = {
  1: ['Biología', 'Historia I', 'Matemáticas', 'Inglés I', 'Geografía', 'Español', 'Artes', 'FCE I'],
  2: ['FCE II', 'Matemáticas', 'Física', 'Inglés II', 'Español', 'Artes', 'Historia II'],
  3: ['Química', 'Matemáticas', 'FCE III', 'Historia III', 'Inglés III', 'Español', 'Artes'],
};

async function ensureMateriasBase() {
  for (const [grado, materias] of Object.entries(MATERIAS_BASE)) {
    for (const nombre of materias) {
      await prisma.materia.upsert({
        where: { nombre_grado: { nombre, grado: parseInt(grado) } },
        update: {},
        create: { nombre, grado: parseInt(grado) },
      });
    }
  }
}

async function getMaterias(req, res) {
  try {
    await ensureMateriasBase();
    const materias = await prisma.materia.findMany({
      orderBy: [{ grado: 'asc' }, { nombre: 'asc' }],
    });

    res.json({ materias });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener materias' });
  }
}

module.exports = { getMaterias, MATERIAS_BASE };
