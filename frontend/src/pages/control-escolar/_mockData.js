// src/pages/control-escolar/_mockData.js

export const GRADOS = ['1°', '2°', '3°'];
export const GRUPOS_LETRAS = ['A', 'B', 'C'];

export const GRUPOS_MOCK = [
  // 1° Grado
  { id:1,  nombre:'1° A', grado:1, aula:'A-101', tutor:'Prof. Juan Hernández',    alumnos:32, promedio:7.6 },
  { id:2,  nombre:'1° B', grado:1, aula:'A-102', tutor:'Profa. Ana López',        alumnos:30, promedio:7.4 },
  { id:3,  nombre:'1° C', grado:1, aula:'A-103', tutor:'Prof. Carlos Ramírez',    alumnos:29, promedio:7.8 },
  // 2° Grado
  { id:4,  nombre:'2° A', grado:2, aula:'B-201', tutor:'Profa. María Sánchez',    alumnos:31, promedio:8.1 },
  { id:5,  nombre:'2° B', grado:2, aula:'B-202', tutor:'Prof. Roberto García',    alumnos:28, promedio:7.7 },
  { id:6,  nombre:'2° C', grado:2, aula:'B-203', tutor:'Profa. Laura Díaz',       alumnos:30, promedio:7.9 },
  // 3° Grado
  { id:7,  nombre:'3° A', grado:3, aula:'C-301', tutor:'Prof. Miguel Torres',     alumnos:27, promedio:8.3 },
  { id:8,  nombre:'3° B', grado:3, aula:'C-302', tutor:'Profa. Patricia Flores',  alumnos:29, promedio:7.8 },
  { id:9,  nombre:'3° C', grado:3, aula:'C-303', tutor:'Prof. Jorge Morales',     alumnos:26, promedio:7.5 },
];

export const MATERIAS_CAT = [
  'Español','Matemáticas','Inglés','Ciencias','Historia',
  'Geografía','Formación Cívica','Ed. Física','Artes','Tecnología',
  'Química','Física','Biología',
];

export const DOCENTES_MOCK = [
  { id:1,  nombre:'Prof. Juan Hernández'   },
  { id:2,  nombre:'Profa. Ana López'       },
  { id:3,  nombre:'Prof. Carlos Ramírez'   },
  { id:4,  nombre:'Profa. María Sánchez'   },
  { id:5,  nombre:'Prof. Roberto García'   },
  { id:6,  nombre:'Profa. Laura Díaz'      },
  { id:7,  nombre:'Prof. Miguel Torres'    },
  { id:8,  nombre:'Profa. Patricia Flores' },
  { id:9,  nombre:'Prof. Jorge Morales'    },
  { id:10, nombre:'Profa. Carmen Vásquez'  },
];

// Asignaciones: docente → materia → grupo → horario
export const ASIGNACIONES_MOCK = [
  { id:1,  docente:'Prof. Juan Hernández',    materia:'Matemáticas',    grupo:'1° A', aula:'A-101', dias:['Lunes','Miércoles','Viernes'], hora:'07:00-07:50', periodoActivo:true  },
  { id:2,  docente:'Profa. Ana López',        materia:'Español',        grupo:'2° B', aula:'B-202', dias:['Martes','Jueves'],            hora:'08:40-09:30', periodoActivo:true  },
  { id:3,  docente:'Prof. Carlos Ramírez',    materia:'Historia',       grupo:'2° A', aula:'B-201', dias:['Lunes','Miércoles'],          hora:'10:40-11:30', periodoActivo:true  },
  { id:4,  docente:'Profa. María Sánchez',    materia:'Ciencias',       grupo:'1° B', aula:'A-102', dias:['Martes','Jueves','Viernes'],  hora:'09:50-10:40', periodoActivo:true  },
  { id:5,  docente:'Prof. Roberto García',    materia:'Inglés',         grupo:'3° C', aula:'C-303', dias:['Lunes','Martes'],            hora:'11:30-12:20', periodoActivo:true  },
  { id:6,  docente:'Profa. Laura Díaz',       materia:'Física',         grupo:'3° B', aula:'C-302', dias:['Miércoles','Viernes'],       hora:'12:20-13:10', periodoActivo:false },
  { id:7,  docente:'Prof. Miguel Torres',     materia:'Química',        grupo:'3° A', aula:'C-301', dias:['Lunes','Jueves'],            hora:'07:50-08:40', periodoActivo:true  },
  { id:8,  docente:'Profa. Patricia Flores',  materia:'Tecnología',     grupo:'1° A', aula:'Lab-1', dias:['Martes','Viernes'],          hora:'09:50-10:40', periodoActivo:true  },
  { id:9,  docente:'Prof. Jorge Morales',     materia:'Artes',          grupo:'1° C', aula:'A-103', dias:['Miércoles'],                hora:'11:30-12:20', periodoActivo:true  },
  { id:10, docente:'Profa. Carmen Vásquez',   materia:'Ed. Física',     grupo:'2° C', aula:'Patio', dias:['Lunes','Miércoles','Viernes'],hora:'08:40-09:30', periodoActivo:true  },
];

export const ALUMNOS_MOCK = [
  { id:1,  nombre:'Juan Pérez García',      grupo:'1° A', matricula:'177001', puntos:85 },
  { id:2,  nombre:'María López Ruiz',       grupo:'2° B', matricula:'177002', puntos:45 },
  { id:3,  nombre:'Carlos Martínez Díaz',   grupo:'3° A', matricula:'177003', puntos:92 },
  { id:4,  nombre:'Ana Hernández Santos',   grupo:'1° B', matricula:'177004', puntos:68 },
  { id:5,  nombre:'Roberto Sánchez Torres', grupo:'2° A', matricula:'177005', puntos:78 },
  { id:6,  nombre:'Laura Ramírez Cruz',     grupo:'3° B', matricula:'177006', puntos:55 },
  { id:7,  nombre:'Jorge Flores Morales',   grupo:'1° C', matricula:'177007', puntos:88 },
  { id:8,  nombre:'Sofía Díaz Morales',     grupo:'2° C', matricula:'177008', puntos:72 },
  { id:9,  nombre:'Miguel Díaz Rodríguez',  grupo:'3° C', matricula:'177009', puntos:38 },
  { id:10, nombre:'Elena Torres Vargas',    grupo:'1° A', matricula:'177010', puntos:91 },
];

export const REPORTES_MOCK = [
  { id:1,  alumno:'Juan Pérez García',      grupo:'1° A', tipo:'Negativo', gravedad:'MEDIO',       delta:-5,  desc:'Llegó tarde sin justificante.',           fecha:'26 Abr 2026', por:'Luis Ramírez (Prefecto)', ptsAntes:90, ptsDespues:85 },
  { id:2,  alumno:'María López Ruiz',       grupo:'2° B', tipo:'Negativo', gravedad:'GRAVE',       delta:-10, desc:'Falta de respeto al docente.',            fecha:'26 Abr 2026', por:'Luis Ramírez (Prefecto)', ptsAntes:55, ptsDespues:45 },
  { id:3,  alumno:'Carlos Martínez Díaz',   grupo:'3° A', tipo:'Positivo', gravedad:'MUY_POSITIVO',delta:+6,  desc:'Participó en concurso de ciencias.',      fecha:'25 Abr 2026', por:'Ana García (Prefecto)',   ptsAntes:86, ptsDespues:92 },
  { id:4,  alumno:'Ana Hernández Santos',   grupo:'1° B', tipo:'Negativo', gravedad:'NO_GRAVE',    delta:-2,  desc:'No portaba uniforme completo.',           fecha:'24 Abr 2026', por:'Luis Ramírez (Prefecto)', ptsAntes:70, ptsDespues:68 },
  { id:5,  alumno:'Roberto Sánchez Torres', grupo:'2° A', tipo:'Negativo', gravedad:'MEDIO',       delta:-5,  desc:'Ausencia injustificada.',                fecha:'24 Abr 2026', por:'Ana García (Prefecto)',   ptsAntes:83, ptsDespues:78 },
  { id:6,  alumno:'Laura Ramírez Cruz',     grupo:'3° B', tipo:'Negativo', gravedad:'GRAVE',       delta:-10, desc:'Conducta agresiva en recreo.',           fecha:'23 Abr 2026', por:'Luis Ramírez (Prefecto)', ptsAntes:65, ptsDespues:55 },
  { id:7,  alumno:'Jorge Flores Morales',   grupo:'1° C', tipo:'Positivo', gravedad:'LEVE',        delta:+2,  desc:'Entregó objeto olvidado a dirección.',   fecha:'22 Abr 2026', por:'Ana García (Prefecto)',   ptsAntes:86, ptsDespues:88 },
  { id:8,  alumno:'Sofía Díaz Morales',     grupo:'2° C', tipo:'Negativo', gravedad:'MEDIO',       delta:-5,  desc:'Uso de celular en clase.',               fecha:'22 Abr 2026', por:'Luis Ramírez (Prefecto)', ptsAntes:77, ptsDespues:72 },
  { id:9,  alumno:'Miguel Díaz Rodríguez',  grupo:'3° C', tipo:'Negativo', gravedad:'GRAVE',       delta:-10, desc:'Falta de respeto grave a compañero.',    fecha:'21 Abr 2026', por:'Luis Ramírez (Prefecto)', ptsAntes:48, ptsDespues:38 },
  { id:10, alumno:'Elena Torres Vargas',    grupo:'1° A', tipo:'Positivo', gravedad:'MEDIANAMENTE',delta:+4,  desc:'Apoyo voluntario en evento cívico.',     fecha:'20 Abr 2026', por:'Ana García (Prefecto)',   ptsAntes:87, ptsDespues:91 },
];

export const PERIODOS_MOCK = [
  { id:1, nombre:'Periodo 1', fechaInicio:'2025-09-01', fechaFin:'2025-11-15', estado:'CERRADO' },
  { id:2, nombre:'Periodo 2', fechaInicio:'2025-11-16', fechaFin:'2026-02-14', estado:'CERRADO' },
  { id:3, nombre:'Periodo 3', fechaInicio:'2026-02-16', fechaFin:'2026-04-30', estado:'ACTIVO'  },
  { id:4, nombre:'Periodo 4', fechaInicio:'2026-05-04', fechaFin:'2026-07-15', estado:'PROXIMO' },
];

export const GRAVEDAD_LABEL = {
  GRAVE:'Grave (-10 pts)', MEDIO:'Medio (-5 pts)', NO_GRAVE:'No grave (-2 pts)',
  MUY_POSITIVO:'Muy positivo (+6 pts)', MEDIANAMENTE:'Medianamente (+4 pts)', LEVE:'Leve (+2 pts)',
};

export function calColor(v) {
  if (v === null || v === undefined) return 'var(--text-muted)';
  if (v < 6)   return '#dc2626';
  if (v < 7.5) return '#d97706';
  return '#16a34a';
}

export function ptsBadgeStyle(pts) {
  if (pts <= 45) return { bg:'#fee2e2', color:'#991b1b' };
  if (pts <= 65) return { bg:'#ffedd5', color:'#c2410c' };
  if (pts <= 79) return { bg:'#fef3c7', color:'#92400e' };
  return { bg:'#dcfce7', color:'#166534' };
}
