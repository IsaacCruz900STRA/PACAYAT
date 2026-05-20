const jwt            = require('jsonwebtoken');
const tokenBlacklist = require('../config/tokenBlacklist');

function auth(req, res, next) {
  const token = req.cookies?.pacayat_token;
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ message: 'Sesión inválida, inicia sesión de nuevo' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // { id, username, rol }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

module.exports = auth;
