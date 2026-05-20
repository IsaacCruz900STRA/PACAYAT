const fs   = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../../../data/blacklist.json');

// Carga inicial desde disco
function loadFromDisk() {
  try {
    if (fs.existsSync(FILE)) {
      const raw = fs.readFileSync(FILE, 'utf8');
      return new Map(Object.entries(JSON.parse(raw)));
    }
  } catch { /* archivo corrupto — empezar limpio */ }
  return new Map();
}

function saveToDisk(map) {
  try {
    fs.writeFileSync(FILE, JSON.stringify(Object.fromEntries(map)), 'utf8');
  } catch { /* no bloquear el flujo si falla el disco */ }
}

const blacklist = loadFromDisk();

function add(token, expiresAt) {
  blacklist.set(token, expiresAt);
  saveToDisk(blacklist);
}

function has(token) {
  const exp = blacklist.get(token);
  if (exp === undefined) return false;
  if (Date.now() > exp) {
    blacklist.delete(token);
    saveToDisk(blacklist);
    return false;
  }
  return true;
}

// Limpieza automática cada hora
setInterval(() => {
  const now = Date.now();
  let changed = false;
  for (const [token, exp] of blacklist) {
    if (now > exp) { blacklist.delete(token); changed = true; }
  }
  if (changed) saveToDisk(blacklist);
}, 60 * 60 * 1000);

module.exports = { add, has };
