const rateLimit = require('express-rate-limit');

// Límite global: 200 peticiones por IP cada 15 minutos
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' },
});

// Límite estricto para rutas de autenticación: 20 intentos por IP cada 15 minutos
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.' },
  skipSuccessfulRequests: true,
});

module.exports = { globalLimiter, authLimiter };
