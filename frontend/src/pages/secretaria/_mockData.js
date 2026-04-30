// src/pages/secretaria/_mockData.js

export const ALUMNOS_MOCK = [
  { id:1,  matricula:'177001', nombre:'Juan Pérez García',       grupo:'1° A', puntos:85, tutorId:1, estado:'Activo' },
  { id:2,  matricula:'177002', nombre:'María López Ruiz',        grupo:'2° B', puntos:45, tutorId:2, estado:'Activo' },
  { id:3,  matricula:'177003', nombre:'Carlos Martínez Díaz',    grupo:'3° A', puntos:92, tutorId:3, estado:'Activo' },
  { id:4,  matricula:'177004', nombre:'Ana Hernández Santos',    grupo:'1° B', puntos:68, tutorId:4, estado:'Activo' },
  { id:5,  matricula:'177005', nombre:'Roberto Sánchez Torres',  grupo:'2° A', puntos:78, tutorId:5, estado:'Activo' },
  { id:6,  matricula:'177006', nombre:'Laura Ramírez Cruz',      grupo:'3° B', puntos:55, tutorId:6, estado:'Activo' },
  { id:7,  matricula:'177007', nombre:'Jorge Flores Morales',    grupo:'1° C', puntos:88, tutorId:7, estado:'Activo' },
  { id:8,  matricula:'177008', nombre:'Sofía Díaz Morales',      grupo:'2° C', puntos:72, tutorId:8, estado:'Activo' },
  { id:9,  matricula:'177009', nombre:'Miguel Díaz Rodríguez',   grupo:'3° C', puntos:38, tutorId:9, estado:'Activo' },
  { id:10, matricula:'177010', nombre:'Elena Torres Vargas',     grupo:'1° A', puntos:91, tutorId:1, estado:'Activo' },
  { id:11, matricula:'177011', nombre:'Diego Ramírez Flores',    grupo:'2° A', puntos:76, tutorId:5, estado:'Activo' },
  { id:12, matricula:'177012', nombre:'Valeria Cruz Mendoza',    grupo:'3° A', puntos:83, tutorId:3, estado:'Activo' },
  { id:13, matricula:'177013', nombre:'Andrés Morales López',    grupo:'1° B', puntos:61, tutorId:4, estado:'Activo' },
  { id:14, matricula:'177014', nombre:'Isabella García Torres',  grupo:'2° B', puntos:94, tutorId:2, estado:'Activo' },
  { id:15, matricula:'177015', nombre:'Sebastián Vega Ruiz',     grupo:'3° B', puntos:47, tutorId:6, estado:'Activo' },
];

export const TUTORES_MOCK = [
  { id:1, nombre:'María García López',     telefono:'951-234-5678', correo:'m.garcia@gmail.com',    parentesco:'Madre' },
  { id:2, nombre:'Carlos López Hernández', telefono:'951-345-6789', correo:'c.lopez@outlook.com',   parentesco:'Padre' },
  { id:3, nombre:'Ana Martínez Soto',      telefono:'951-456-7890', correo:'a.martinez@gmail.com',  parentesco:'Madre' },
  { id:4, nombre:'Roberto Hernández Cruz', telefono:'951-567-8901', correo:'r.hernandez@yahoo.com', parentesco:'Padre' },
  { id:5, nombre:'Laura Sánchez Díaz',     telefono:'951-678-9012', correo:'l.sanchez@gmail.com',   parentesco:'Madre' },
  { id:6, nombre:'Jorge Ramírez Vega',     telefono:'951-789-0123', correo:'j.ramirez@hotmail.com', parentesco:'Padre' },
  { id:7, nombre:'Patricia Flores Torres', telefono:'951-890-1234', correo:'p.flores@gmail.com',    parentesco:'Madre' },
  { id:8, nombre:'Manuel Díaz Morales',    telefono:'951-901-2345', correo:'m.diaz@gmail.com',      parentesco:'Padre' },
  { id:9, nombre:'Carmen Rodríguez Luna',  telefono:'951-012-3456', correo:'c.rodriguez@yahoo.com', parentesco:'Madre' },
];

export const GRUPOS_LISTA = [
  '1° A','1° B','1° C',
  '2° A','2° B','2° C',
  '3° A','3° B','3° C',
];

export function ptsBadgeStyle(pts) {
  if (pts <= 45) return { bg:'#fee2e2', color:'#991b1b' };
  if (pts <= 65) return { bg:'#ffedd5', color:'#c2410c' };
  if (pts <= 79) return { bg:'#fef3c7', color:'#92400e' };
  return { bg:'#dcfce7', color:'#166634' };
}
