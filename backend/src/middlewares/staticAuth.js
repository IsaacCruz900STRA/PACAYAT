const jwt            = require('jsonwebtoken');
const tokenBlacklist = require('../config/tokenBlacklist');

function staticAuth(req, res, next) {
  const token = req.cookies?.pacayat_token;
  if (!token) return res.status(401).json({ message: 'No autenticado' });
  if (tokenBlacklist.has(token)) return res.status(401).json({ message: 'Sesión inválida' });
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

module.exports = staticAuth;
