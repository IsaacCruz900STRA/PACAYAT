const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const auth     = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');
const ctrl     = require('../controllers/avisoController');

const PUEDEN_GESTIONAR = ['ADMIN', 'DIRECTIVO', 'SECRETARIA'];

// ── Multer para documentos de avisos ─────────────────────────────────────────
const uploadDir = path.join(__dirname, '../../uploads/avisos');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const safe = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
    cb(null, `${Date.now()}-${safe}${ext}`);
  },
});

const uploadDoc = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// ── Rutas ─────────────────────────────────────────────────────────────────────
router.get('/',    auth,                                ctrl.getAvisos);
router.post('/',   auth, roleGuard(PUEDEN_GESTIONAR),   ctrl.createAviso);
router.put('/:id', auth, roleGuard(PUEDEN_GESTIONAR),   ctrl.updateAviso);
router.delete('/:id', auth, roleGuard(PUEDEN_GESTIONAR),ctrl.deleteAviso);

// Upload de documento adjunto — devuelve { nombre, ruta, tamanio, mimetype }
router.post('/upload', auth, roleGuard(PUEDEN_GESTIONAR), uploadDoc.single('file'), ctrl.uploadDocumento);

module.exports = router;
