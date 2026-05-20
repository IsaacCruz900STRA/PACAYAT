// Lista negra de tokens JWT revocados (en memoria — se limpia al reiniciar)
// Almacena: token -> timestamp de expiración
const blacklist = new Map();

function add(token, expiresAt) {
  blacklist.set(token, expiresAt);
}

function has(token) {
  const exp = blacklist.get(token);
  if (exp === undefined) return false;
  if (Date.now() > exp) {
    blacklist.delete(token);
    return false;
  }
  return true;
}

// Limpieza automática cada hora para evitar acumulación de tokens expirados
setInterval(() => {
  const now = Date.now();
  for (const [token, exp] of blacklist) {
    if (now > exp) blacklist.delete(token);
  }
}, 60 * 60 * 1000);

module.exports = { add, has };
