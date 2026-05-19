// Parsea un PDF de aSc Horarios → devuelve el horario por grupo.
// Usa pdf2json para obtener texto con coordenadas (x, y) en unidades
// de "Units" (1 Unit ≈ 4.5 puntos PDF, escala interna de pdf2json).

const PDFParser = require('pdf2json');

const DIAS_ABREV  = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi'];
const DIAS_ENUM   = { Lu:'LUNES', Ma:'MARTES', Mi:'MIERCOLES', Ju:'JUEVES', Vi:'VIERNES' };
const SLOTS_COUNT = 9;

const SKIP_RE = [
  /^Lu$/, /^Ma$/, /^Mi$/, /^Ju$/, /^Vi$/,
  /^[1-9]$/, /^RECESO$/i,
  /^\d+:\d+\s*[-–]\s*\d+:\d+$/,
  /^Horario generado/i, /^aSc Horarios$/i,
  /^\d+°[A-I]$/i,
];

function shouldSkip(text) {
  return SKIP_RE.some(r => r.test(text.trim()));
}

function decodeText(raw = '') {
  return decodeURIComponent(raw).trim();
}

function normalizar(str = '') {
  return str.trim()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/profr?a?\.?\s*/gi, '')
    .replace(/\s+/g, ' ').trim();
}

function limpiarDocente(str = '') {
  return str.replace(/^(PROFR[A]?\.?\s*|DR[A]?\.?\s*)/i, '').trim();
}

// Agrupa items por líneas horizontales cercanas
function agruparLineas(items, tolerY = 0.3) {
  if (!items.length) return [];
  const sorted = [...items].sort((a, b) => a.y - b.y); // y crece hacia abajo en pdf2json
  const lines  = [];
  let cur = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    if (Math.abs(sorted[i].y - sorted[i - 1].y) <= tolerY) {
      cur.push(sorted[i]);
    } else {
      lines.push(cur.sort((a, b) => a.x - b.x).map(t => t.text).join(' '));
      cur = [sorted[i]];
    }
  }
  lines.push(cur.sort((a, b) => a.x - b.x).map(t => t.text).join(' '));
  return lines.map(l => l.trim()).filter(Boolean);
}

function parsearPagina(pdfPage) {
  if (!pdfPage?.Texts?.length) return null;

  // Extraer todos los ítems de texto con posición
  const items = [];
  for (const t of pdfPage.Texts) {
    const raw = t.R?.map(r => decodeText(r.T)).join('') || '';
    if (!raw) continue;
    items.push({ text: raw, x: t.x, y: t.y });
  }

  // ── 1. Nombre del grupo ──────────────────────────────────────────────────
  const grupoItem = items.find(it => /^\d°[A-I]$/i.test(it.text));
  if (!grupoItem) return null;
  const grupoNombre = grupoItem.text;

  // ── 2. Encabezados de días → centros de columna ──────────────────────────
  const dayItems = {};
  for (const abr of DIAS_ABREV) {
    const matches = items.filter(it => it.text === abr);
    if (matches.length) {
      // El encabezado más arriba (menor y en pdf2json)
      dayItems[abr] = matches.reduce((a, b) => (a.y < b.y ? a : b));
    }
  }
  if (Object.keys(dayItems).length < 5) return null;

  const diasOrd = DIAS_ABREV.filter(d => dayItems[d]).sort((a, b) => dayItems[a].x - dayItems[b].x);

  // Calcular límites de columna
  const colDefs = diasOrd.map((dia, i) => {
    const xC    = dayItems[dia].x;
    const prevX = i > 0 ? dayItems[diasOrd[i - 1]].x : 0;
    const nextX = i < diasOrd.length - 1 ? dayItems[diasOrd[i + 1]].x : xC + 10;
    return { dia, xMin: (xC + prevX) / 2, xMax: (xC + nextX) / 2, xC };
  });

  // X mínima del grid (borde izquierdo de la primera columna)
  const gridXMin = colDefs[0].xMin;

  // ── 3. Números de bloque → centros de fila ────────────────────────────────
  const slotItems = items
    .filter(it => /^[1-9]$/.test(it.text) && it.x < gridXMin)
    .sort((a, b) => a.y - b.y); // orden top→bottom (y crece hacia abajo)

  // Fallback: usar etiquetas de hora
  if (slotItems.length < 3) {
    const timeItems = items
      .filter(it => /^\d+:\d+\s*[-–]\s*\d+:\d+$/.test(it.text) && it.x < gridXMin)
      .sort((a, b) => a.y - b.y);
    slotItems.push(...timeItems.slice(0, SLOTS_COUNT).map((t, i) => ({ ...t, text: String(i + 1) })));
  }

  const slotsRef = slotItems.slice(0, SLOTS_COUNT);
  if (!slotsRef.length) return null;

  const rowDefs = slotsRef.map((si, i) => {
    const yC    = si.y;
    const prevY = i > 0 ? slotsRef[i - 1].y : 0;
    const nextY = i < slotsRef.length - 1 ? slotsRef[i + 1].y : yC + 5;
    return { slot: i + 1, yMin: (yC + prevY) / 2, yMax: (yC + nextY) / 2, yC };
  });

  // ── 4. Asignar texto a celdas ────────────────────────────────────────────
  function findCol(x) { return colDefs.find(c => x >= c.xMin && x < c.xMax) || null; }
  function findRow(y) { return rowDefs.find(r => y >= r.yMin && y <= r.yMax) || null; }

  const celdas = {};
  for (const it of items) {
    if (shouldSkip(it.text)) continue;
    if (it.x < gridXMin) continue; // leyenda / columna de tiempos

    const col = findCol(it.x);
    const row = findRow(it.y);
    if (!col || !row) continue;

    const key = `${col.dia}_${row.slot}`;
    if (!celdas[key]) celdas[key] = [];
    celdas[key].push({ text: it.text, y: it.y, x: it.x });
  }

  // ── 5. Construir grid ─────────────────────────────────────────────────────
  const grid = {};
  for (const dia of DIAS_ABREV) {
    grid[dia] = {};
    for (let s = 1; s <= SLOTS_COUNT; s++) grid[dia][s] = null;
  }

  // Patrón para detectar si un texto es nombre de docente (no de materia)
  const DOCENTE_RE = /^PROF(R|RA)?\.?\s/i;

  for (const [key, textos] of Object.entries(celdas)) {
    const [dia, slotStr] = key.split('_');
    const slot   = parseInt(slotStr);
    const lineas = agruparLineas(textos);

    // Separar: primera línea que NO sea un nombre de docente = materia
    let materia = null;
    let docente = null;
    const docenteLineas = [];

    for (const linea of lineas) {
      if (!materia && !DOCENTE_RE.test(linea.trim())) {
        materia = linea;
      } else {
        docenteLineas.push(linea);
      }
    }

    if (!materia) continue; // Solo había nombre de docente, celda inválida

    docente = docenteLineas.length ? limpiarDocente(docenteLineas.join(' ')) : null;
    grid[dia][slot] = { materia, docente, salon: null };
  }

  return { nombre: grupoNombre, grid };
}

// Parsea el buffer del PDF y retorna array de grupos
function parsearPDF(buffer) {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser(null, 1); // 1 = verbosidad silenciosa

    parser.on('pdfParser_dataError', err => reject(new Error(err.parserError || String(err))));

    parser.on('pdfParser_dataReady', pdfData => {
      try {
        const grupos = [];
        for (const page of (pdfData.Pages || [])) {
          const resultado = parsearPagina(page);
          if (resultado) grupos.push(resultado);
        }
        resolve(grupos);
      } catch (e) {
        reject(e);
      }
    });

    parser.parseBuffer(buffer);
  });
}

module.exports = { parsearPDF, normalizar, limpiarDocente };
