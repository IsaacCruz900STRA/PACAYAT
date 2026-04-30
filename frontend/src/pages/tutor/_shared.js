// src/pages/tutor/_shared.js
// Datos mock compartidos por todas las páginas del tutor.
// TODO: reemplazar cada bloque con su llamada API correspondiente.

// ── Gauge conducta ────────────────────────────────────────────
export function nivelInfo(pts) {
  if (pts >= 85) return { label:'Excelente',       color:'#16a34a', bg:'#f0fdf4', msg:'¡Excelente! Tu hijo está teniendo un muy buen desempeño en conducta.'      };
  if (pts >= 70) return { label:'Bueno',            color:'#2563eb', bg:'#eff6ff', msg:'Tu hijo tiene un buen comportamiento. Sigue así.'                          };
  if (pts >= 60) return { label:'Regular',          color:'#d97706', bg:'#fffbeb', msg:'El comportamiento puede mejorar. Te recomendamos platicar con tu hijo.'     };
  if (pts >= 45) return { label:'En riesgo',        color:'#ea580c', bg:'#fff7ed', msg:'Tu hijo necesita mejorar su conducta. Por favor contacta a la escuela.'    };
  return          { label:'Atención urgente',       color:'#dc2626', bg:'#fef2f2', msg:'Situación crítica. Te pedimos contactar a la escuela a la brevedad posible.' };
}

// ── Colores de calificaciones ─────────────────────────────────
export function calColor(v) {
  if (v === null || v === undefined) return 'var(--text-muted)';
  if (v < 6)   return '#dc2626';
  if (v < 7.5) return '#d97706';
  return '#16a34a';
}

// ── Horario ──────────────────────────────────────────────────
export const HORAS_HORARIO = [
  { id:1, label:'07:00 - 07:50' },
  { id:2, label:'07:50 - 08:40' },
  { id:3, label:'08:40 - 09:30' },
  { id:'R', receso: true },
  { id:4, label:'09:50 - 10:40' },
  { id:5, label:'10:40 - 11:30' },
  { id:6, label:'11:30 - 12:20' },
  { id:7, label:'12:20 - 13:10' },
];
export const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes'];

const COLORES = [
  { bg:'#dbeafe', border:'#93c5fd', text:'#1e40af' },
  { bg:'#dcfce7', border:'#86efac', text:'#14532d' },
  { bg:'#f3e8ff', border:'#d8b4fe', text:'#6b21a8' },
  { bg:'#ffedd5', border:'#fdba74', text:'#c2410c' },
  { bg:'#ccfbf1', border:'#5eead4', text:'#0f766e' },
  { bg:'#fef3c7', border:'#fcd34d', text:'#92400e' },
  { bg:'#fce7f3', border:'#f9a8d4', text:'#9d174d' },
];
export function colorMat(mat) {
  let h = 0;
  for (const c of mat) h = (h * 31 + c.charCodeAt(0)) % COLORES.length;
  return COLORES[h];
}

// TODO: reemplazar con getHorarioHijo(idAlumno)
export const HORARIO_MOCK = {
  Lunes:     { 1:{mat:'Español',     salon:'A-01'}, 2:{mat:'Matemáticas', salon:'B-02'}, 4:{mat:'Ciencias',  salon:'C-03'}, 6:{mat:'Historia',  salon:'A-02'} },
  Martes:    { 1:{mat:'Ed. Física',  salon:'Patio'}, 3:{mat:'Inglés',     salon:'B-03'}, 5:{mat:'Artes',     salon:'A-04'} },
  Miércoles: { 2:{mat:'Matemáticas', salon:'B-02'}, 4:{mat:'Geografía',  salon:'C-01'}, 6:{mat:'F. Cívica', salon:'A-02'} },
  Jueves:    { 1:{mat:'Español',     salon:'A-01'}, 3:{mat:'Tecnología', salon:'Lab-1'}, 5:{mat:'Ciencias',  salon:'C-03'} },
  Viernes:   { 2:{mat:'Inglés',      salon:'B-03'}, 4:{mat:'Matemáticas',salon:'B-02'}, 6:{mat:'Historia',  salon:'A-02'} },
};

// TODO: reemplazar con getBoletaHijo(idAlumno)
export const PERIODOS = ['Periodo 1','Periodo 2','Periodo 3','Periodo 4','Periodo 5'];
export const MATERIAS_MOCK = [
  { materia:'Español',       cals:[8.0,7.5,7.8,7.2,null], faltas:[0,1,0,0,0] },
  { materia:'Matemáticas',   cals:[7.0,6.5,7.0,6.8,null], faltas:[1,0,1,1,0] },
  { materia:'Inglés',        cals:[8.5,8.0,8.2,7.8,null], faltas:[0,0,0,0,0] },
  { materia:'Ciencias',      cals:[7.5,7.0,7.2,7.0,null], faltas:[0,1,0,0,0] },
  { materia:'Historia',      cals:[8.0,7.8,8.0,7.5,null], faltas:[0,0,0,0,0] },
  { materia:'Geografía',     cals:[7.8,7.5,7.6,7.2,null], faltas:[0,0,1,0,0] },
  { materia:'F. Cívica',     cals:[8.5,8.2,8.0,8.0,null], faltas:[0,0,0,0,0] },
  { materia:'Ed. Física',    cals:[9.0,8.8,9.0,8.5,null], faltas:[0,0,0,1,0] },
  { materia:'Artes',         cals:[8.2,8.0,8.5,8.0,null], faltas:[0,0,0,0,0] },
  { materia:'Tecnología',    cals:[7.5,7.2,7.0,6.8,null], faltas:[1,0,0,1,0] },
];

// TODO: reemplazar con getReportesHijo(idAlumno)
export const GRAVEDAD_LABEL = {
  GRAVE:'Grave (-10 pts)', MEDIO:'Medio (-5 pts)', NO_GRAVE:'No grave (-2 pts)',
  MUY_POSITIVO:'Muy positivo (+6 pts)', MEDIANAMENTE:'Medianamente (+4 pts)', LEVE:'Leve (+2 pts)',
};
export const REPORTES_MOCK = [
  { tipo:'Negativo', gravedad:'MEDIO',        delta:-5,  fecha:'26 de abril, 2026',  hora:'2:15 PM',  desc:'Llegó tarde a clase de matemáticas sin justificación. Se habló con el alumno.', por:'Luis Ramírez Santos (Prefecto)', ptsAntes:63, ptsDespues:58 },
  { tipo:'Negativo', gravedad:'NO_GRAVE',     delta:-2,  fecha:'24 de abril, 2026',  hora:'11:30 AM', desc:'No portaba uniforme completo.',                                                  por:'Patricia Morales (Prefecto)',    ptsAntes:65, ptsDespues:63 },
  { tipo:'Positivo', gravedad:'MUY_POSITIVO', delta:+6,  fecha:'20 de abril, 2026',  hora:'10:00 AM', desc:'Participó activamente en el evento cívico de la escuela.',                      por:'Luis Ramírez Santos (Prefecto)', ptsAntes:59, ptsDespues:65 },
  { tipo:'Negativo', gravedad:'GRAVE',        delta:-10, fecha:'15 de abril, 2026',  hora:'9:00 AM',  desc:'Falta de respeto hacia un compañero. Se citó al padre de familia.',              por:'Luis Ramírez Santos (Prefecto)', ptsAntes:69, ptsDespues:59 },
  { tipo:'Negativo', gravedad:'MEDIO',        delta:-5,  fecha:'10 de abril, 2026',  hora:'8:30 AM',  desc:'Ausencia injustificada al tercer bloque.',                                      por:'Patricia Morales (Prefecto)',    ptsAntes:74, ptsDespues:69 },
  { tipo:'Positivo', gravedad:'LEVE',         delta:+2,  fecha:'5 de abril, 2026',   hora:'1:30 PM',  desc:'Entregó objeto olvidado por compañero a la dirección.',                         por:'Luis Ramírez Santos (Prefecto)', ptsAntes:72, ptsDespues:74 },
];
