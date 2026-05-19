/**
 * Paleta de colores canónica para el módulo de Horarios.
 * Cada materia tiene un color pastel fijo en TODA la aplicación.
 * Los talleres comparten el color lima.
 */

export const MATERIA_COLORS = {
  // Académicas
  'Matemáticas':                  { bg:'#DBEAFE', border:'#93C5FD', text:'#1E40AF' },
  'Español':                      { bg:'#FEE2E2', border:'#FCA5A5', text:'#991B1B' },
  'Ciencias':                     { bg:'#D1FAE5', border:'#6EE7B7', text:'#065F46' },
  'Ciencias I':                   { bg:'#D1FAE5', border:'#6EE7B7', text:'#065F46' },
  'Ciencias II':                  { bg:'#D1FAE5', border:'#6EE7B7', text:'#065F46' },
  'Ciencias III':                 { bg:'#D1FAE5', border:'#6EE7B7', text:'#065F46' },
  'Historia':                     { bg:'#FEF3C7', border:'#FCD34D', text:'#92400E' },
  'Historia I':                   { bg:'#FEF3C7', border:'#FCD34D', text:'#92400E' },
  'Historia II':                  { bg:'#FEF3C7', border:'#FCD34D', text:'#92400E' },
  'Historia III':                 { bg:'#FEF3C7', border:'#FCD34D', text:'#92400E' },
  'Geografía':                    { bg:'#FFEDD5', border:'#FDBA74', text:'#C2410C' },
  'Formación Cívica y Ética':     { bg:'#E0E7FF', border:'#A5B4FC', text:'#3730A3' },
  'Formación Cívica y Ética I':   { bg:'#E0E7FF', border:'#A5B4FC', text:'#3730A3' },
  'Formación Cívica y Ética II':  { bg:'#E0E7FF', border:'#A5B4FC', text:'#3730A3' },
  'Formación Cívica y Ética III': { bg:'#E0E7FF', border:'#A5B4FC', text:'#3730A3' },
  'FCyE':                         { bg:'#E0E7FF', border:'#A5B4FC', text:'#3730A3' },
  'FCyE I':                       { bg:'#E0E7FF', border:'#A5B4FC', text:'#3730A3' },
  'FCyE II':                      { bg:'#E0E7FF', border:'#A5B4FC', text:'#3730A3' },
  'FCyE III':                     { bg:'#E0E7FF', border:'#A5B4FC', text:'#3730A3' },
  'Inglés':                       { bg:'#EDE9FE', border:'#C4B5FD', text:'#5B21B6' },
  'Inglés I':                     { bg:'#EDE9FE', border:'#C4B5FD', text:'#5B21B6' },
  'Inglés II':                    { bg:'#EDE9FE', border:'#C4B5FD', text:'#5B21B6' },
  'Inglés III':                   { bg:'#EDE9FE', border:'#C4B5FD', text:'#5B21B6' },
  'Artes':                        { bg:'#FCE7F3', border:'#F9A8D4', text:'#9D174D' },
  'Educación Física':             { bg:'#CCFBF1', border:'#5EEAD4', text:'#0F766E' },
  'Ed. Física':                   { bg:'#CCFBF1', border:'#5EEAD4', text:'#0F766E' },
  // Talleres — todos lima pastel
  'Turismo':                      { bg:'#FEF9C3', border:'#FDE047', text:'#713F12' },
  'Informática':                  { bg:'#FEF9C3', border:'#FDE047', text:'#713F12' },
  'Electrónica':                  { bg:'#FEF9C3', border:'#FDE047', text:'#713F12' },
  'Contabilidad':                 { bg:'#FEF9C3', border:'#FDE047', text:'#713F12' },
  'Diseño Gráfico':               { bg:'#FEF9C3', border:'#FDE047', text:'#713F12' },
  'Diseño Industrial':            { bg:'#FEF9C3', border:'#FDE047', text:'#713F12' },
  'Taller':                       { bg:'#FEF9C3', border:'#FDE047', text:'#713F12' },
};

// Paleta fallback para materias no listadas o para grupos en vista docente
export const PALETTE = [
  { bg:'#DBEAFE', border:'#93C5FD', text:'#1E40AF' },
  { bg:'#D1FAE5', border:'#6EE7B7', text:'#065F46' },
  { bg:'#F3E8FF', border:'#D8B4FE', text:'#6B21A8' },
  { bg:'#FFEDD5', border:'#FDBA74', text:'#C2410C' },
  { bg:'#CCFBF1', border:'#5EEAD4', text:'#0F766E' },
  { bg:'#FEF3C7', border:'#FCD34D', text:'#92400E' },
  { bg:'#FCE7F3', border:'#F9A8D4', text:'#9D174D' },
  { bg:'#E0E7FF', border:'#A5B4FC', text:'#3730A3' },
  { bg:'#FEE2E2', border:'#FCA5A5', text:'#991B1B' },
  { bg:'#EDE9FE', border:'#C4B5FD', text:'#5B21B6' },
];

function hashStr(str) {
  let h = 0;
  for (const c of (str || '')) h = (h * 31 + c.charCodeAt(0)) % PALETTE.length;
  return h;
}

/** Color para materia: paleta fija si está registrada, hash como fallback. */
export function colorMateria(materia) {
  if (!materia) return PALETTE[0];
  return MATERIA_COLORS[materia.trim()] || PALETTE[hashStr(materia)];
}

/** Color para grupo en vista docente: hash determinista por nombre del grupo. */
export function colorGrupo(grupoNombre) {
  return PALETTE[hashStr(grupoNombre)];
}
