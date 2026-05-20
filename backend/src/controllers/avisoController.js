const prisma = require('../config/db');
const path   = require('path');
const fs     = require('fs');

// ── Asegurar que existe el directorio de uploads ──────────────────────────────
const UPLOAD_DIR = path.join(__dirname, '../../uploads/avisos');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ── GET /avisos ───────────────────────────────────────────────────────────────
async function getAvisos(req, res) {
  const { tipo, activo } = req.query;
  const where = {};
  if (tipo)   where.tipo   = tipo;
  if (activo !== undefined) where.activo = activo === 'true';

  try {
    const avisos = await prisma.aviso.findMany({
      where,
      orderBy: { creadoEn: 'desc' },
    });
    res.json({ avisos, total: avisos.length });
  } catch {
    res.status(500).json({ message: 'Error al obtener avisos' });
  }
}

// ── POST /avisos ──────────────────────────────────────────────────────────────
async function createAviso(req, res) {
  const { tipo, titulo, mensaje, umbralPuntos, canales = [], documentos = [] } = req.body;
  if (!tipo || !titulo || !mensaje) {
    return res.status(400).json({ message: 'tipo, titulo y mensaje son obligatorios' });
  }
  try {
    const aviso = await prisma.aviso.create({
      data: {
        tipo,
        titulo:      titulo.trim(),
        mensaje:     mensaje.trim(),
        umbralPuntos: umbralPuntos ? parseInt(umbralPuntos) : null,
        canales,
        documentos,
      },
    });
    res.status(201).json(aviso);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear aviso' });
  }
}

// ── PUT /avisos/:id ───────────────────────────────────────────────────────────
async function updateAviso(req, res) {
  const { id } = req.params;
  const { tipo, titulo, mensaje, umbralPuntos, canales, activo, documentos } = req.body;
  try {
    const aviso = await prisma.aviso.update({
      where: { id: parseInt(id) },
      data: {
        ...(tipo        !== undefined && { tipo }),
        ...(titulo      !== undefined && { titulo: titulo.trim() }),
        ...(mensaje     !== undefined && { mensaje: mensaje.trim() }),
        ...(umbralPuntos!== undefined && { umbralPuntos: umbralPuntos ? parseInt(umbralPuntos) : null }),
        ...(canales     !== undefined && { canales }),
        ...(activo      !== undefined && { activo: Boolean(activo) }),
        ...(documentos  !== undefined && { documentos }),
      },
    });
    res.json(aviso);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar aviso' });
  }
}

// ── DELETE /avisos/:id ────────────────────────────────────────────────────────
async function deleteAviso(req, res) {
  const { id } = req.params;
  try {
    // Eliminar archivos físicos asociados
    const aviso = await prisma.aviso.findUnique({ where: { id: parseInt(id) } });
    if (aviso?.documentos?.length) {
      aviso.documentos.forEach(doc => {
        const fullPath = path.join(__dirname, '../../', doc.ruta.replace(/^\//, ''));
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      });
    }
    await prisma.aviso.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Aviso eliminado' });
  } catch {
    res.status(500).json({ message: 'Error al eliminar aviso' });
  }
}

// ── POST /avisos/upload ───────────────────────────────────────────────────────
function uploadDocumento(req, res) {
  if (!req.file) return res.status(400).json({ message: 'No se recibió ningún archivo' });
  res.json({
    nombre:   req.file.originalname,
    ruta:     `/uploads/avisos/${req.file.filename}`,
    tamanio:  req.file.size,
    mimetype: req.file.mimetype,
  });
}

module.exports = { getAvisos, createAviso, updateAviso, deleteAviso, uploadDocumento };
