// prisma/seed.js — Datos de prueba completos para PACAYAT
// Ejecutar: node prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed completo...');

  const hash = await bcrypt.hash('1234', 10);

  // ── 1. USUARIOS ────────────────────────────────────────────────────────────
  const usrAdmin = await prisma.usuario.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', nombre: 'Ana García López', password: hash, rol: 'ADMIN' },
  });
  const usrDirectivo = await prisma.usuario.upsert({
    where: { username: 'directivo' },
    update: {},
    create: { username: 'directivo', nombre: 'Carlos Ramírez Vega', password: hash, rol: 'DIRECTIVO' },
  });
  const usrDocente1 = await prisma.usuario.upsert({
    where: { username: 'docente1' },
    update: {},
    create: { username: 'docente1', nombre: 'María López Torres', password: hash, rol: 'DOCENTE' },
  });
  const usrDocente2 = await prisma.usuario.upsert({
    where: { username: 'docente2' },
    update: {},
    create: { username: 'docente2', nombre: 'Roberto Sánchez Pérez', password: hash, rol: 'DOCENTE' },
  });
  const usrDocente3 = await prisma.usuario.upsert({
    where: { username: 'docente3' },
    update: {},
    create: { username: 'docente3', nombre: 'Elena Morales Díaz', password: hash, rol: 'DOCENTE' },
  });
  const usrPrefecto = await prisma.usuario.upsert({
    where: { username: 'prefecto' },
    update: {},
    create: { username: 'prefecto', nombre: 'Juan Martínez Soto', password: hash, rol: 'PREFECTO' },
  });
  const usrSecretaria = await prisma.usuario.upsert({
    where: { username: 'secretaria' },
    update: {},
    create: { username: 'secretaria', nombre: 'Rosa Hernández Cruz', password: hash, rol: 'SECRETARIA' },
  });
  const usrControl = await prisma.usuario.upsert({
    where: { username: 'control_escolar' },
    update: {},
    create: { username: 'control_escolar', nombre: 'Pedro González Ruiz', password: hash, rol: 'CONTROL_ESCOLAR' },
  });
  // Usuarios tutor
  const usrTutor1 = await prisma.usuario.upsert({
    where: { username: 'tutor_lucia' },
    update: {},
    create: { username: 'tutor_lucia', nombre: 'Lucía Pérez Morales', password: hash, rol: 'TUTOR' },
  });
  const usrTutor2 = await prisma.usuario.upsert({
    where: { username: 'tutor_miguel' },
    update: {},
    create: { username: 'tutor_miguel', nombre: 'Miguel Torres Vega', password: hash, rol: 'TUTOR' },
  });
  const usrTutor3 = await prisma.usuario.upsert({
    where: { username: 'tutor_patricia' },
    update: {},
    create: { username: 'tutor_patricia', nombre: 'Patricia Fuentes Ríos', password: hash, rol: 'TUTOR' },
  });

  console.log('✅ Usuarios creados');

  // ── 2. PERSONAL ────────────────────────────────────────────────────────────
  await prisma.personal.upsert({
    where: { idUsuario: usrAdmin.id },
    update: {},
    create: { nombre: 'Ana García López', rol: 'ADMIN', idUsuario: usrAdmin.id },
  });
  await prisma.personal.upsert({
    where: { idUsuario: usrDirectivo.id },
    update: {},
    create: { nombre: 'Carlos Ramírez Vega', rol: 'DIRECTIVO', idUsuario: usrDirectivo.id },
  });
  const pDocente1 = await prisma.personal.upsert({
    where: { idUsuario: usrDocente1.id },
    update: {},
    create: {
      nombre: 'María López Torres', rol: 'DOCENTE',
      especialidad: 'Matemáticas', telefono: '5512345001',
      correo: 'mlopez@sec177.edu.mx', idUsuario: usrDocente1.id,
    },
  });
  const pDocente2 = await prisma.personal.upsert({
    where: { idUsuario: usrDocente2.id },
    update: {},
    create: {
      nombre: 'Roberto Sánchez Pérez', rol: 'DOCENTE',
      especialidad: 'Español', telefono: '5512345002',
      correo: 'rsanchez@sec177.edu.mx', idUsuario: usrDocente2.id,
    },
  });
  const pDocente3 = await prisma.personal.upsert({
    where: { idUsuario: usrDocente3.id },
    update: {},
    create: {
      nombre: 'Elena Morales Díaz', rol: 'DOCENTE',
      especialidad: 'Ciencias', telefono: '5512345003',
      correo: 'emorales@sec177.edu.mx', idUsuario: usrDocente3.id,
    },
  });
  await prisma.personal.upsert({
    where: { idUsuario: usrPrefecto.id },
    update: {},
    create: { nombre: 'Juan Martínez Soto', rol: 'PREFECTO', telefono: '5512345004', idUsuario: usrPrefecto.id },
  });
  await prisma.personal.upsert({
    where: { idUsuario: usrSecretaria.id },
    update: {},
    create: { nombre: 'Rosa Hernández Cruz', rol: 'SECRETARIA', telefono: '5512345005', idUsuario: usrSecretaria.id },
  });
  await prisma.personal.upsert({
    where: { idUsuario: usrControl.id },
    update: {},
    create: { nombre: 'Pedro González Ruiz', rol: 'CONTROL_ESCOLAR', telefono: '5512345006', idUsuario: usrControl.id },
  });

  console.log('✅ Personal creado');

  // ── 3. TUTORES ─────────────────────────────────────────────────────────────
  const tutor1 = await prisma.tutor.upsert({
    where: { idUsuario: usrTutor1.id },
    update: {},
    create: {
      nombreCompleto: 'Lucía Pérez Morales', telefono: '5598761001',
      correo: 'lucia.perez@gmail.com', idUsuario: usrTutor1.id,
    },
  });
  const tutor2 = await prisma.tutor.upsert({
    where: { idUsuario: usrTutor2.id },
    update: {},
    create: {
      nombreCompleto: 'Miguel Torres Vega', telefono: '5598761002',
      correo: 'miguel.torres@gmail.com', idUsuario: usrTutor2.id,
    },
  });
  const tutor3 = await prisma.tutor.upsert({
    where: { idUsuario: usrTutor3.id },
    update: {},
    create: {
      nombreCompleto: 'Patricia Fuentes Ríos', telefono: '5598761003',
      correo: 'patricia.fuentes@gmail.com', idUsuario: usrTutor3.id,
    },
  });

  console.log('✅ Tutores creados');

  // ── 4. PERIODO ESCOLAR ─────────────────────────────────────────────────────
  const periodoEscolar = await prisma.periodoEscolar.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1, nombre: '2025-2026',
      fechaInicio: new Date('2025-08-25'),
      fechaFin: new Date('2026-07-10'),
      activo: true,
    },
  });

  // ── 5. PERIODOS DE EVALUACIÓN ──────────────────────────────────────────────
  const p1 = await prisma.periodoEvaluacion.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, nombre: 'Parcial 1', fechaInicio: new Date('2025-08-25'), fechaFin: new Date('2025-11-07') },
  });
  const p2 = await prisma.periodoEvaluacion.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, nombre: 'Parcial 2', fechaInicio: new Date('2025-11-10'), fechaFin: new Date('2026-03-06') },
  });
  const p3 = await prisma.periodoEvaluacion.upsert({
    where: { id: 3 },
    update: {},
    create: { id: 3, nombre: 'Parcial 3', fechaInicio: new Date('2026-03-09'), fechaFin: new Date('2026-07-10') },
  });

  console.log('✅ Periodos creados');

  // ── 6. GRUPOS ──────────────────────────────────────────────────────────────
  const g1A = await prisma.grupo.upsert({ where: { nombre: '1°A' }, update: {}, create: { nombre: '1°A', grado: 1, seccion: 'A' } });
  const g1B = await prisma.grupo.upsert({ where: { nombre: '1°B' }, update: {}, create: { nombre: '1°B', grado: 1, seccion: 'B' } });
  const g2A = await prisma.grupo.upsert({ where: { nombre: '2°A' }, update: {}, create: { nombre: '2°A', grado: 2, seccion: 'A' } });
  const g2B = await prisma.grupo.upsert({ where: { nombre: '2°B' }, update: {}, create: { nombre: '2°B', grado: 2, seccion: 'B' } });
  const g3A = await prisma.grupo.upsert({ where: { nombre: '3°A' }, update: {}, create: { nombre: '3°A', grado: 3, seccion: 'A' } });
  const g3B = await prisma.grupo.upsert({ where: { nombre: '3°B' }, update: {}, create: { nombre: '3°B', grado: 3, seccion: 'B' } });

  console.log('✅ Grupos creados');

  // ── 7. MATERIAS ────────────────────────────────────────────────────────────
  const upsertMateria = (nombre, grado, clave) =>
    prisma.materia.upsert({ where: { nombre_grado: { nombre, grado } }, update: {}, create: { nombre, grado, clave } });

  const mMat1  = await upsertMateria('Matemáticas', 1, 'MAT-1');
  const mEsp1  = await upsertMateria('Español', 1, 'ESP-1');
  const mBio1  = await upsertMateria('Biología', 1, 'BIO-1');
  const mHis1  = await upsertMateria('Historia I', 1, 'HIS-1');
  const mGeo1  = await upsertMateria('Geografía', 1, 'GEO-1');
  const mIng1  = await upsertMateria('Inglés I', 1, 'ING-1');
  const mArt1  = await upsertMateria('Artes', 1, 'ART-1');
  const mFce1  = await upsertMateria('FCE I', 1, 'FCE-1');

  const mMat2  = await upsertMateria('Matemáticas', 2, 'MAT-2');
  const mEsp2  = await upsertMateria('Español', 2, 'ESP-2');
  const mFis2  = await upsertMateria('Física', 2, 'FIS-2');
  const mHis2  = await upsertMateria('Historia II', 2, 'HIS-2');
  const mIng2  = await upsertMateria('Inglés II', 2, 'ING-2');
  const mArt2  = await upsertMateria('Artes', 2, 'ART-2');
  const mFce2  = await upsertMateria('FCE II', 2, 'FCE-2');

  const mMat3  = await upsertMateria('Matemáticas', 3, 'MAT-3');
  const mEsp3  = await upsertMateria('Español', 3, 'ESP-3');
  const mQui3  = await upsertMateria('Química', 3, 'QUI-3');
  const mHis3  = await upsertMateria('Historia III', 3, 'HIS-3');
  const mIng3  = await upsertMateria('Inglés III', 3, 'ING-3');
  const mArt3  = await upsertMateria('Artes', 3, 'ART-3');
  const mFce3  = await upsertMateria('FCE III', 3, 'FCE-3');

  console.log('✅ Materias creadas');

  // ── 8. ASOCIAR MATERIAS A DOCENTES ─────────────────────────────────────────
  await prisma.personal.update({
    where: { id: pDocente1.id },
    data: { materias: { set: [{ id: mMat1.id }, { id: mMat2.id }] } },
  });
  await prisma.personal.update({
    where: { id: pDocente2.id },
    data: { materias: { set: [{ id: mEsp1.id }, { id: mEsp2.id }, { id: mEsp3.id }] } },
  });
  await prisma.personal.update({
    where: { id: pDocente3.id },
    data: { materias: { set: [{ id: mBio1.id }, { id: mFis2.id }, { id: mQui3.id }] } },
  });

  // ── 9. ASIGNACIONES (docente → materia → grupo) ────────────────────────────
  const upsertAsig = (idDocente, idMateria, idGrupo) =>
    prisma.asignacion.upsert({
      where: { idDocente_idMateria_idGrupo: { idDocente, idMateria, idGrupo } },
      update: {},
      create: { idDocente, idMateria, idGrupo },
    });

  const asig_mat1_1A = await upsertAsig(pDocente1.id, mMat1.id, g1A.id);
  const asig_mat1_1B = await upsertAsig(pDocente1.id, mMat1.id, g1B.id);
  const asig_mat2_2A = await upsertAsig(pDocente1.id, mMat2.id, g2A.id);
  const asig_mat2_2B = await upsertAsig(pDocente1.id, mMat2.id, g2B.id);

  const asig_esp1_1A = await upsertAsig(pDocente2.id, mEsp1.id, g1A.id);
  const asig_esp1_1B = await upsertAsig(pDocente2.id, mEsp1.id, g1B.id);
  const asig_esp2_2A = await upsertAsig(pDocente2.id, mEsp2.id, g2A.id);
  const asig_esp3_3A = await upsertAsig(pDocente2.id, mEsp3.id, g3A.id);

  const asig_bio1_1A = await upsertAsig(pDocente3.id, mBio1.id, g1A.id);
  const asig_fis2_2A = await upsertAsig(pDocente3.id, mFis2.id, g2A.id);
  const asig_qui3_3A = await upsertAsig(pDocente3.id, mQui3.id, g3A.id);
  const asig_qui3_3B = await upsertAsig(pDocente3.id, mQui3.id, g3B.id);

  console.log('✅ Asignaciones creadas');

  // ── 10. ALUMNOS ────────────────────────────────────────────────────────────
  const upsertAlumno = (data) =>
    prisma.alumno.upsert({ where: { matricula: data.matricula }, update: {}, create: data });

  // 1°A — 4 alumnos (todos arrancan con 100, los reportes ajustan puntos)
  const a1 = await upsertAlumno({ nombreCompleto: 'Sofía Mendoza Rivera', matricula: '2025001', curp: 'MERS110205MDFNVF01', fechaNacimiento: new Date('2011-02-05'), domicilio: 'Av. Juárez 12, Col. Centro', puntosConducta: 100, grado: 1, idGrupo: g1A.id, idTutor: tutor1.id });
  const a2 = await upsertAlumno({ nombreCompleto: 'Diego Ramos Castro', matricula: '2025002', curp: 'RACD110817HDFMSD01', fechaNacimiento: new Date('2011-08-17'), domicilio: 'Calle Morelos 45, Col. Reforma', puntosConducta: 100, grado: 1, idGrupo: g1A.id, idTutor: tutor2.id });
  const a3 = await upsertAlumno({ nombreCompleto: 'Camila Reyes Olvera', matricula: '2025003', curp: 'REOC111103MDFYLM01', fechaNacimiento: new Date('2011-11-03'), domicilio: 'Privada las Flores 7', puntosConducta: 100, grado: 1, idGrupo: g1A.id, idTutor: tutor1.id });
  const a4 = await upsertAlumno({ nombreCompleto: 'Andrés Vega Ruiz', matricula: '2025004', curp: 'VERA110622HDFGRN01', fechaNacimiento: new Date('2011-06-22'), domicilio: 'Blvd. Norte 89', puntosConducta: 100, grado: 1, idGrupo: g1A.id, idTutor: tutor3.id });

  // 1°B — 3 alumnos
  const a5 = await upsertAlumno({ nombreCompleto: 'Valeria Ortiz Nuñez', matricula: '2025005', curp: 'ONVL110315MDFRTL01', fechaNacimiento: new Date('2011-03-15'), domicilio: 'Cerrada Pino 33', puntosConducta: 100, grado: 1, idGrupo: g1B.id, idTutor: tutor2.id });
  const a6 = await upsertAlumno({ nombreCompleto: 'Rodrigo Salinas Torres', matricula: '2025006', curp: 'SATR111229HDFLDG01', fechaNacimiento: new Date('2011-12-29'), domicilio: 'Av. Insurgentes 201', puntosConducta: 100, grado: 1, idGrupo: g1B.id, idTutor: tutor3.id });
  const a7 = await upsertAlumno({ nombreCompleto: 'Isabella Cruz Medina', matricula: '2025007', curp: 'CUMI110407MDFRZB01', fechaNacimiento: new Date('2011-04-07'), domicilio: 'Prolongación Sur 14', puntosConducta: 100, grado: 1, idGrupo: g1B.id, idTutor: tutor1.id });

  // 2°A — 3 alumnos
  const a8  = await upsertAlumno({ nombreCompleto: 'Valentina Ortiz Fuentes', matricula: '2024001', curp: 'ORFV100519MDFRTL01', fechaNacimiento: new Date('2010-05-19'), domicilio: 'Calle Cedro 6', puntosConducta: 100, grado: 2, idGrupo: g2A.id, idTutor: tutor3.id });
  const a9  = await upsertAlumno({ nombreCompleto: 'Mateo Flores Jiménez', matricula: '2024002', curp: 'FLIM101010HDFLTR01', fechaNacimiento: new Date('2010-10-10'), domicilio: 'Priv. Encino 28', puntosConducta: 100, grado: 2, idGrupo: g2A.id, idTutor: tutor2.id });
  const a10 = await upsertAlumno({ nombreCompleto: 'Luciana Herrera Vázquez', matricula: '2024003', curp: 'HEVL100731MDFRZC01', fechaNacimiento: new Date('2010-07-31'), domicilio: 'Col. Las Palmas 55', puntosConducta: 100, grado: 2, idGrupo: g2A.id, idTutor: tutor1.id });

  // 2°B — 2 alumnos
  const a11 = await upsertAlumno({ nombreCompleto: 'Santiago Mora Leal', matricula: '2024004', curp: 'MALS100215HDFRNL01', fechaNacimiento: new Date('2010-02-15'), domicilio: 'Lomas Verdes 7B', puntosConducta: 100, grado: 2, idGrupo: g2B.id, idTutor: tutor3.id });
  const a12 = await upsertAlumno({ nombreCompleto: 'Mariana Delgado Ríos', matricula: '2024005', curp: 'DERM100904MDFRLR01', fechaNacimiento: new Date('2010-09-04'), domicilio: 'Av. Sánchez 100', puntosConducta: 100, grado: 2, idGrupo: g2B.id, idTutor: tutor2.id });

  // 3°A — 3 alumnos
  const a13 = await upsertAlumno({ nombreCompleto: 'Emilio Vargas Peña', matricula: '2023001', curp: 'VAPE090301HDFRGM01', fechaNacimiento: new Date('2009-03-01'), domicilio: 'Calle Real 47', puntosConducta: 100, grado: 3, idGrupo: g3A.id, idTutor: tutor2.id });
  const a14 = await upsertAlumno({ nombreCompleto: 'Renata Campos Vidal', matricula: '2023002', curp: 'CAVR090825MDFMLN01', fechaNacimiento: new Date('2009-08-25'), domicilio: 'Av. Constitución 67', puntosConducta: 100, grado: 3, idGrupo: g3A.id, idTutor: tutor3.id });
  const a15 = await upsertAlumno({ nombreCompleto: 'Hugo Alvarado Ruiz', matricula: '2023003', curp: 'ARHU090614HDFLLG01', fechaNacimiento: new Date('2009-06-14'), domicilio: 'Calz. del Valle 32', puntosConducta: 100, grado: 3, idGrupo: g3A.id, idTutor: tutor1.id });

  // 3°B — 2 alumnos
  const a16 = await upsertAlumno({ nombreCompleto: 'Fernanda Ríos Castillo', matricula: '2023004', curp: 'RICF090418MDFSSL01', fechaNacimiento: new Date('2009-04-18'), domicilio: 'Col. San Marcos 12', puntosConducta: 100, grado: 3, idGrupo: g3B.id, idTutor: tutor2.id });
  const a17 = await upsertAlumno({ nombreCompleto: 'Carlos Mendoza Bravo', matricula: '2023005', curp: 'MEBC090720HDFNRL01', fechaNacimiento: new Date('2009-07-20'), domicilio: 'Paseo Loma Alta 5', puntosConducta: 100, grado: 3, idGrupo: g3B.id, idTutor: tutor3.id });

  console.log('✅ Alumnos creados');

  // ── 11. INSCRIPCIONES ──────────────────────────────────────────────────────
  const upsertInsc = (idAlumno, idGrupo) =>
    prisma.inscripcion.upsert({
      where: { idAlumno_idPeriodoEscolar: { idAlumno, idPeriodoEscolar: periodoEscolar.id } },
      update: {},
      create: { idAlumno, idPeriodoEscolar: periodoEscolar.id, idGrupo, activa: true },
    });

  const i1  = await upsertInsc(a1.id, g1A.id);
  const i2  = await upsertInsc(a2.id, g1A.id);
  const i3  = await upsertInsc(a3.id, g1A.id);
  const i4  = await upsertInsc(a4.id, g1A.id);
  const i5  = await upsertInsc(a5.id, g1B.id);
  const i6  = await upsertInsc(a6.id, g1B.id);
  const i7  = await upsertInsc(a7.id, g1B.id);
  const i8  = await upsertInsc(a8.id,  g2A.id);
  const i9  = await upsertInsc(a9.id,  g2A.id);
  const i10 = await upsertInsc(a10.id, g2A.id);
  const i11 = await upsertInsc(a11.id, g2B.id);
  const i12 = await upsertInsc(a12.id, g2B.id);
  const i13 = await upsertInsc(a13.id, g3A.id);
  const i14 = await upsertInsc(a14.id, g3A.id);
  const i15 = await upsertInsc(a15.id, g3A.id);
  const i16 = await upsertInsc(a16.id, g3B.id);
  const i17 = await upsertInsc(a17.id, g3B.id);

  console.log('✅ Inscripciones creadas');

  // ── 12. CALIFICACIONES ─────────────────────────────────────────────────────
  const upsertCal = (idInscripcion, idAsignacion, idPeriodo, calificacion) =>
    prisma.calificacion.upsert({
      where: { idInscripcion_idAsignacion_idPeriodo: { idInscripcion, idAsignacion, idPeriodo } },
      update: {},
      create: { idInscripcion, idAsignacion, idPeriodo, calificacion },
    });

  // Alumnos de 1°A: Matemáticas y Español (parciales 1 y 2)
  await upsertCal(i1.id, asig_mat1_1A.id, p1.id, 9.5);
  await upsertCal(i1.id, asig_mat1_1A.id, p2.id, 8.7);
  await upsertCal(i1.id, asig_esp1_1A.id, p1.id, 9.0);
  await upsertCal(i1.id, asig_esp1_1A.id, p2.id, 9.2);
  await upsertCal(i1.id, asig_bio1_1A.id, p1.id, 8.5);

  await upsertCal(i2.id, asig_mat1_1A.id, p1.id, 6.5);
  await upsertCal(i2.id, asig_mat1_1A.id, p2.id, 5.8);
  await upsertCal(i2.id, asig_esp1_1A.id, p1.id, 7.0);
  await upsertCal(i2.id, asig_bio1_1A.id, p1.id, 6.0);

  await upsertCal(i3.id, asig_mat1_1A.id, p1.id, 10.0);
  await upsertCal(i3.id, asig_mat1_1A.id, p2.id, 9.8);
  await upsertCal(i3.id, asig_esp1_1A.id, p1.id, 9.5);
  await upsertCal(i3.id, asig_bio1_1A.id, p1.id, 9.0);

  await upsertCal(i4.id, asig_mat1_1A.id, p1.id, 4.5);
  await upsertCal(i4.id, asig_esp1_1A.id, p1.id, 5.0);
  await upsertCal(i4.id, asig_bio1_1A.id, p1.id, 4.0);

  // Alumnos de 1°B
  await upsertCal(i5.id, asig_mat1_1B.id, p1.id, 8.0);
  await upsertCal(i5.id, asig_mat1_1B.id, p2.id, 8.5);
  await upsertCal(i5.id, asig_esp1_1B.id, p1.id, 7.5);

  await upsertCal(i6.id, asig_mat1_1B.id, p1.id, 9.5);
  await upsertCal(i6.id, asig_esp1_1B.id, p1.id, 10.0);

  await upsertCal(i7.id, asig_mat1_1B.id, p1.id, 5.5);
  await upsertCal(i7.id, asig_esp1_1B.id, p1.id, 6.0);

  // Alumnos de 2°A
  await upsertCal(i8.id,  asig_mat2_2A.id, p1.id, 9.0);
  await upsertCal(i8.id,  asig_mat2_2A.id, p2.id, 8.5);
  await upsertCal(i8.id,  asig_esp2_2A.id, p1.id, 8.0);
  await upsertCal(i8.id,  asig_fis2_2A.id, p1.id, 7.5);

  await upsertCal(i9.id,  asig_mat2_2A.id, p1.id, 7.0);
  await upsertCal(i9.id,  asig_esp2_2A.id, p1.id, 7.5);
  await upsertCal(i9.id,  asig_fis2_2A.id, p1.id, 6.5);

  await upsertCal(i10.id, asig_mat2_2A.id, p1.id, 3.5);
  await upsertCal(i10.id, asig_esp2_2A.id, p1.id, 4.0);
  await upsertCal(i10.id, asig_fis2_2A.id, p1.id, 3.0);

  // Alumnos de 2°B
  await upsertCal(i11.id, asig_mat2_2B.id, p1.id, 8.5);
  await upsertCal(i11.id, asig_mat2_2B.id, p2.id, 9.0);

  await upsertCal(i12.id, asig_mat2_2B.id, p1.id, 9.5);
  await upsertCal(i12.id, asig_mat2_2B.id, p2.id, 10.0);

  // Alumnos de 3°A
  await upsertCal(i13.id, asig_esp3_3A.id, p1.id, 4.5);
  await upsertCal(i13.id, asig_qui3_3A.id, p1.id, 5.0);

  await upsertCal(i14.id, asig_esp3_3A.id, p1.id, 9.8);
  await upsertCal(i14.id, asig_qui3_3A.id, p1.id, 9.5);

  await upsertCal(i15.id, asig_esp3_3A.id, p1.id, 6.0);
  await upsertCal(i15.id, asig_qui3_3A.id, p1.id, 5.5);

  // Alumnos de 3°B
  await upsertCal(i16.id, asig_qui3_3B.id, p1.id, 9.0);
  await upsertCal(i17.id, asig_qui3_3B.id, p1.id, 7.5);

  console.log('✅ Calificaciones creadas');

  // ── 13. REPORTES (solo si no existen) ─────────────────────────────────────
  const reporteCount = await prisma.reporte.count();
  if (reporteCount === 0) {
    const DELTAS = { GRAVE: -10, MEDIO: -5, NO_GRAVE: -2, LEVE: 2, MEDIANAMENTE: 4, MUY_POSITIVO: 6 };

    const crearReporte = async (idAlumno, idInscripcion, tipo, gravedad, descripcion) => {
      const alumno = await prisma.alumno.findUnique({ where: { id: idAlumno }, select: { puntosConducta: true } });
      const puntosAntes = alumno.puntosConducta;
      const puntosDespues = Math.max(0, Math.min(100, puntosAntes + (DELTAS[gravedad] ?? 0)));
      await prisma.alumno.update({ where: { id: idAlumno }, data: { puntosConducta: puntosDespues } });
      return prisma.reporte.create({
        data: { idAlumno, idInscripcion, idUsuarioReporta: usrPrefecto.id, tipo, gravedad, descripcion, puntosAntes, puntosDespues },
      });
    };

    await crearReporte(a4.id,  i4.id,  'NEGATIVO', 'GRAVE',       'Agresión física a compañero en el patio');
    await crearReporte(a4.id,  i4.id,  'NEGATIVO', 'MEDIO',       'Lenguaje inapropiado con el docente');
    await crearReporte(a4.id,  i4.id,  'NEGATIVO', 'GRAVE',       'Reincidencia: agresión verbal en pasillo');
    await crearReporte(a10.id, i10.id, 'NEGATIVO', 'GRAVE',       'Daño intencional a material del salón');
    await crearReporte(a10.id, i10.id, 'NEGATIVO', 'MEDIO',       'Inasistencias no justificadas reiteradas');
    await crearReporte(a10.id, i10.id, 'NEGATIVO', 'GRAVE',       'Reincidencia: falta de respeto al docente');
    await crearReporte(a13.id, i13.id, 'NEGATIVO', 'GRAVE',       'Altercado con prefecto');
    await crearReporte(a13.id, i13.id, 'NEGATIVO', 'MEDIO',       'Salió sin permiso del plantel');
    await crearReporte(a2.id,  i2.id,  'NEGATIVO', 'NO_GRAVE',    'Llegó tarde a 3 clases esta semana');
    await crearReporte(a2.id,  i2.id,  'NEGATIVO', 'NO_GRAVE',    'Tarea incompleta en dos ocasiones');
    await crearReporte(a7.id,  i7.id,  'NEGATIVO', 'MEDIO',       'Uso de teléfono celular durante clase');
    await crearReporte(a15.id, i15.id, 'NEGATIVO', 'MEDIO',       'Falta de respeto a compañero');
    await crearReporte(a3.id,  i3.id,  'POSITIVO', 'MUY_POSITIVO','Primer lugar en olimpiada de matemáticas estatal');
    await crearReporte(a6.id,  i6.id,  'POSITIVO', 'MUY_POSITIVO','Representó a la escuela en evento cultural');
    await crearReporte(a14.id, i14.id, 'POSITIVO', 'MUY_POSITIVO','Excelente desempeño en proyecto final de ciencias');
    await crearReporte(a1.id,  i1.id,  'POSITIVO', 'MEDIANAMENTE','Apoyó a compañeros con dificultades académicas');
    await crearReporte(a12.id, i12.id, 'POSITIVO', 'LEVE',        'Entregó tarea con calidad sobresaliente');

    console.log('✅ Reportes creados');
  } else {
    console.log('⏭️  Reportes ya existen — se omite creación');
  }

  // ── 14. AVISOS DE CONDUCTA ─────────────────────────────────────────────────
  const upsertAviso = (tipo, titulo, mensaje, umbralPuntos, canales) =>
    prisma.aviso.upsert({
      where: { id: tipo === 'CONDUCTA' && umbralPuntos === 70 ? 1 : tipo === 'CONDUCTA' && umbralPuntos === 50 ? 2 : 3 },
      update: {},
      create: { tipo, titulo, mensaje, umbralPuntos, canales },
    });

  await prisma.aviso.upsert({
    where: { id: 1 },
    update: {},
    create: {
      tipo: 'CONDUCTA', titulo: 'Alerta de conducta moderada',
      mensaje: 'El alumno ha descendido a 70 puntos de conducta. Se recomienda reunión con tutor.',
      umbralPuntos: 70, canales: ['PLATAFORMA'],
    },
  });
  await prisma.aviso.upsert({
    where: { id: 2 },
    update: {},
    create: {
      tipo: 'CONDUCTA', titulo: 'Alerta de conducta grave',
      mensaje: 'El alumno ha descendido a 50 puntos de conducta. Requiere intervención urgente.',
      umbralPuntos: 50, canales: ['PLATAFORMA', 'CORREO'],
    },
  });
  await prisma.aviso.upsert({
    where: { id: 3 },
    update: {},
    create: {
      tipo: 'GENERAL', titulo: 'Periodo de reinscripción 2026-2027',
      mensaje: 'El periodo de reinscripción para el ciclo 2026-2027 estará abierto del 1 al 31 de mayo.',
      umbralPuntos: null, canales: ['PLATAFORMA'],
    },
  });

  console.log('✅ Avisos creados');

  // ── 15. CONFIGURACIÓN ESCUELA ──────────────────────────────────────────────
  await prisma.configuracionEscuela.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nombre: 'Secundaria Técnica 177',
      direccion: 'Av. Revolución 500, Col. Centro, CDMX',
      telefono: '55 1234 5600',
      correo: 'contacto@sec177.edu.mx',
      director: 'Carlos Ramírez Vega',
    },
  });

  console.log('✅ Configuración escuela creada');
  console.log('\n🎉 Seed completado exitosamente');
  console.log('\n📋 Usuarios de prueba (contraseña: 1234)');
  console.log('   admin           → ADMIN');
  console.log('   directivo       → DIRECTIVO');
  console.log('   docente1        → DOCENTE (Matemáticas)');
  console.log('   docente2        → DOCENTE (Español)');
  console.log('   docente3        → DOCENTE (Ciencias)');
  console.log('   prefecto        → PREFECTO');
  console.log('   secretaria      → SECRETARIA');
  console.log('   control_escolar → CONTROL_ESCOLAR');
  console.log('   tutor_lucia     → TUTOR');
  console.log('\n📊 Datos creados:');
  console.log('   17 alumnos  |  6 grupos  |  22 materias');
  console.log('   12 asignaciones  |  ~33 calificaciones  |  17 reportes (si DB estaba vacía)');
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
