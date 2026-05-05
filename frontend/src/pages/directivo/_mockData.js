// src/pages/directivo/_mockData.js

export const ALUMNOS_MOCK = [
  { id:1,  matricula:'177001', nombre:'Juan Pérez García',       grupo:'1° A', puntos:85, tutor:'María García',      estado:'Activo' },
  { id:2,  matricula:'177002', nombre:'María López Ruiz',        grupo:'2° B', puntos:45, tutor:'Carlos López',      estado:'Activo' },
  { id:3,  matricula:'177003', nombre:'Carlos Martínez Díaz',    grupo:'3° A', puntos:92, tutor:'Ana Martínez',      estado:'Activo' },
  { id:4,  matricula:'177004', nombre:'Ana Hernández Santos',    grupo:'1° B', puntos:68, tutor:'Roberto Hernández', estado:'Activo' },
  { id:5,  matricula:'177005', nombre:'Roberto Sánchez Torres',  grupo:'2° A', puntos:78, tutor:'Laura Sánchez',     estado:'Activo' },
  { id:6,  matricula:'177006', nombre:'Laura Ramírez Cruz',      grupo:'3° B', puntos:55, tutor:'Jorge Ramírez',     estado:'Activo' },
  { id:7,  matricula:'177007', nombre:'Jorge Flores Morales',    grupo:'1° C', puntos:88, tutor:'Patricia Flores',   estado:'Activo' },
  { id:8,  matricula:'177008', nombre:'Sofía Díaz Morales',      grupo:'2° C', puntos:72, tutor:'Manuel Díaz',       estado:'Activo' },
  { id:9,  matricula:'177009', nombre:'Miguel Díaz Rodríguez',   grupo:'3° C', puntos:38, tutor:'Carmen Rodríguez',  estado:'Activo' },
  { id:10, matricula:'177010', nombre:'Elena Torres Vargas',     grupo:'1° A', puntos:91, tutor:'Sergio Torres',     estado:'Activo' },
];

export const PERSONAL_MOCK = [
  { id:1,  nombre:'Prof. Juan Hernández',     rol:'DOCENTE',        materia:'Matemáticas', telefono:'951-234-5678', correo:'j.hernandez@st177.edu.mx', estado:'Activo' },
  { id:2,  nombre:'Profa. Ana López',         rol:'DOCENTE',        materia:'Español',     telefono:'951-345-6789', correo:'a.lopez@st177.edu.mx',     estado:'Activo' },
  { id:3,  nombre:'Prof. Carlos Ramírez',     rol:'DOCENTE',        materia:'Historia',    telefono:'951-456-7890', correo:'c.ramirez@st177.edu.mx',   estado:'Activo' },
  { id:4,  nombre:'Profa. María Sánchez',     rol:'DOCENTE',        materia:'Ciencias',    telefono:'951-567-8901', correo:'m.sanchez@st177.edu.mx',   estado:'Activo' },
  { id:5,  nombre:'Prof. Roberto García',     rol:'DOCENTE',        materia:'Inglés',      telefono:'951-678-9012', correo:'r.garcia@st177.edu.mx',    estado:'Activo' },
  { id:6,  nombre:'Luis Ramírez Santos',      rol:'PREFECTO',       materia:'—',           telefono:'951-789-0123', correo:'l.ramirez@st177.edu.mx',   estado:'Activo' },
  { id:7,  nombre:'Patricia Morales Cruz',    rol:'PREFECTO',       materia:'—',           telefono:'951-890-1234', correo:'p.morales@st177.edu.mx',   estado:'Activo' },
  { id:8,  nombre:'Laura Torres Méndez',      rol:'SECRETARIA',     materia:'—',           telefono:'951-901-2345', correo:'l.torres@st177.edu.mx',    estado:'Activo' },
  { id:9,  nombre:'Ing. Miguel Cruz',         rol:'CONTROL_ESCOLAR',materia:'—',           telefono:'951-012-3456', correo:'m.cruz@st177.edu.mx',      estado:'Activo' },
];

export const REPORTES_MOCK = [
  { id:1,  alumno:'Juan Pérez García',      grupo:'1° A', tipo:'Negativo', gravedad:'MEDIO',        delta:-5,  desc:'Llegó tarde sin justificante.',            fecha:'26 Abr 2026', por:'Luis Ramírez (Prefecto)', ptsAntes:90, ptsDespues:85 },
  { id:2,  alumno:'María López Ruiz',       grupo:'2° B', tipo:'Negativo', gravedad:'GRAVE',        delta:-10, desc:'Falta de respeto al docente.',             fecha:'26 Abr 2026', por:'Luis Ramírez (Prefecto)', ptsAntes:55, ptsDespues:45 },
  { id:3,  alumno:'Carlos Martínez Díaz',   grupo:'3° A', tipo:'Positivo', gravedad:'MUY_POSITIVO', delta:+6,  desc:'Participó en concurso de ciencias.',       fecha:'25 Abr 2026', por:'Ana García (Prefecto)',   ptsAntes:86, ptsDespues:92 },
  { id:4,  alumno:'Ana Hernández Santos',   grupo:'1° B', tipo:'Negativo', gravedad:'NO_GRAVE',     delta:-2,  desc:'No portaba uniforme completo.',            fecha:'24 Abr 2026', por:'Luis Ramírez (Prefecto)', ptsAntes:70, ptsDespues:68 },
  { id:5,  alumno:'Roberto Sánchez Torres', grupo:'2° A', tipo:'Negativo', gravedad:'MEDIO',        delta:-5,  desc:'Ausencia injustificada.',                 fecha:'24 Abr 2026', por:'Ana García (Prefecto)',   ptsAntes:83, ptsDespues:78 },
  { id:6,  alumno:'Laura Ramírez Cruz',     grupo:'3° B', tipo:'Negativo', gravedad:'GRAVE',        delta:-10, desc:'Conducta agresiva en recreo.',            fecha:'23 Abr 2026', por:'Luis Ramírez (Prefecto)', ptsAntes:65, ptsDespues:55 },
  { id:7,  alumno:'Jorge Flores Morales',   grupo:'1° C', tipo:'Positivo', gravedad:'LEVE',         delta:+2,  desc:'Entregó objeto olvidado a dirección.',    fecha:'22 Abr 2026', por:'Ana García (Prefecto)',   ptsAntes:86, ptsDespues:88 },
  { id:8,  alumno:'Sofía Díaz Morales',     grupo:'2° C', tipo:'Negativo', gravedad:'MEDIO',        delta:-5,  desc:'Uso de celular en clase.',                fecha:'22 Abr 2026', por:'Luis Ramírez (Prefecto)', ptsAntes:77, ptsDespues:72 },
  { id:9,  alumno:'Miguel Díaz Rodríguez',  grupo:'3° C', tipo:'Negativo', gravedad:'GRAVE',        delta:-10, desc:'Falta de respeto grave a compañero.',     fecha:'21 Abr 2026', por:'Luis Ramírez (Prefecto)', ptsAntes:48, ptsDespues:38 },
  { id:10, alumno:'Elena Torres Vargas',    grupo:'1° A', tipo:'Positivo', gravedad:'MEDIANAMENTE', delta:+4,  desc:'Apoyo voluntario en evento cívico.',      fecha:'20 Abr 2026', por:'Ana García (Prefecto)',   ptsAntes:87, ptsDespues:91 },
];

// Horarios por persona
export const HORARIOS_MOCK = {
  'Prof. Juan Hernández': {
    Lunes:     { 1:{mat:'Matemáticas',grupo:'1° A',salon:'A-01'}, 3:{mat:'Álgebra',grupo:'2° B',salon:'B-03'}, 5:{mat:'Geometría',grupo:'3° A',salon:'A-05'} },
    Martes:    { 2:{mat:'Álgebra',grupo:'2° B',salon:'B-03'}, 4:{mat:'Geometría',grupo:'3° C',salon:'C-02'} },
    Miércoles: { 1:{mat:'Matemáticas',grupo:'1° A',salon:'A-01'}, 7:{mat:'Álgebra',grupo:'2° B',salon:'B-03'} },
    Jueves:    { 2:{mat:'Geometría',grupo:'3° C',salon:'C-02'}, 4:{mat:'Geometría',grupo:'3° A',salon:'A-05'} },
    Viernes:   { 1:{mat:'Matemáticas',grupo:'1° A',salon:'A-01'}, 3:{mat:'Geometría',grupo:'3° C',salon:'C-02'} },
  },
  'Luis Ramírez Santos': {
    Lunes:     { 1:{mat:'Prefectura',salon:'Patio'}, 2:{mat:'Prefectura',salon:'Patio'}, 3:{mat:'Prefectura',salon:'Patio'}, 4:{mat:'Prefectura',salon:'Patio'} },
    Martes:    { 1:{mat:'Prefectura',salon:'Patio'}, 2:{mat:'Prefectura',salon:'Patio'}, 3:{mat:'Prefectura',salon:'Patio'} },
    Miércoles: { 1:{mat:'Prefectura',salon:'Patio'}, 2:{mat:'Prefectura',salon:'Patio'} },
    Jueves:    { 1:{mat:'Prefectura',salon:'Patio'}, 2:{mat:'Prefectura',salon:'Patio'}, 3:{mat:'Prefectura',salon:'Patio'} },
    Viernes:   { 1:{mat:'Prefectura',salon:'Patio'}, 2:{mat:'Prefectura',salon:'Patio'} },
  },
};

// Horario de alumnos (comparte el grupo)
export const HORARIO_ALUMNO = {
  Lunes:     { 1:{mat:'Español',salon:'A-01'}, 2:{mat:'Matemáticas',salon:'B-02'}, 4:{mat:'Ciencias',salon:'C-03'}, 6:{mat:'Historia',salon:'A-02'} },
  Martes:    { 1:{mat:'Ed. Física',salon:'Patio'}, 3:{mat:'Inglés',salon:'B-03'}, 5:{mat:'Artes',salon:'A-04'} },
  Miércoles: { 2:{mat:'Matemáticas',salon:'B-02'}, 4:{mat:'Geografía',salon:'C-01'}, 6:{mat:'F. Cívica',salon:'A-02'} },
  Jueves:    { 1:{mat:'Español',salon:'A-01'}, 3:{mat:'Tecnología',salon:'Lab-1'}, 5:{mat:'Ciencias',salon:'C-03'} },
  Viernes:   { 2:{mat:'Inglés',salon:'B-03'}, 4:{mat:'Matemáticas',salon:'B-02'}, 6:{mat:'Historia',salon:'A-02'} },
};

export const GRAVEDAD_LABEL = {
  GRAVE:'Grave (-10 pts)', MEDIO:'Medio (-5 pts)', NO_GRAVE:'No grave (-2 pts)',
  MUY_POSITIVO:'Muy positivo (+6 pts)', MEDIANAMENTE:'Medianamente (+4 pts)', LEVE:'Leve (+2 pts)',
};

export const ROL_LABEL = {
  DOCENTE:'Docente', PREFECTO:'Prefecto', SECRETARIA:'Secretaria',
  CONTROL_ESCOLAR:'Control Escolar', ADMIN:'Administrador',
};

export const ROL_VARIANT = {
  DOCENTE:'docente', PREFECTO:'prefecto', SECRETARIA:'secretaria',
  CONTROL_ESCOLAR:'control', ADMIN:'admin',
};

export function ptsBadgeStyle(pts) {
  if (pts <= 45) return { bg:'#fee2e2', color:'#991b1b' };
  if (pts <= 65) return { bg:'#ffedd5', color:'#c2410c' };
  if (pts <= 79) return { bg:'#fef3c7', color:'#92400e' };
  return { bg:'#dcfce7', color:'#166634' };
}

// Colores de horario por materia
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

export const HORAS_HORARIO = [
  { id:1, label:'07:00 - 07:50' }, { id:2, label:'07:50 - 08:40' },
  { id:3, label:'08:40 - 09:30' }, { id:'R', receso:true },
  { id:4, label:'09:50 - 10:40' }, { id:5, label:'10:40 - 11:30' },
  { id:6, label:'11:30 - 12:20' }, { id:7, label:'12:20 - 13:10' },
];
export const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes'];
