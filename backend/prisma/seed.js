// prisma/seed.js
// Ejecutar: node prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  const hash = await bcrypt.hash('1234', 10);

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

  const usrDocente = await prisma.usuario.upsert({
    where: { username: 'docente' },
    update: {},
    create: { username: 'docente', nombre: 'María López Torres', password: hash, rol: 'DOCENTE' },
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

  const usrTutor = await prisma.usuario.upsert({
    where: { username: 'tutor' },
    update: {},
    create: { username: 'tutor', nombre: 'Lucía Pérez Morales', password: hash, rol: 'TUTOR' },
  });

  console.log('✅ Usuarios creados');

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

  const personalDocente = await prisma.personal.upsert({
    where: { idUsuario: usrDocente.id },
    update: {},
    create: { nombre: 'María López Torres', rol: 'DOCENTE', idUsuario: usrDocente.id },
  });

  await prisma.personal.upsert({
    where: { idUsuario: usrPrefecto.id },
    update: {},
    create: { nombre: 'Juan Martínez Soto', rol: 'PREFECTO', idUsuario: usrPrefecto.id },
  });

  await prisma.personal.upsert({
    where: { idUsuario: usrSecretaria.id },
    update: {},
    create: { nombre: 'Rosa Hernández Cruz', rol: 'SECRETARIA', idUsuario: usrSecretaria.id },
  });

  await prisma.personal.upsert({
    where: { idUsuario: usrControl.id },
    update: {},
    create: { nombre: 'Pedro González Ruiz', rol: 'CONTROL_ESCOLAR', idUsuario: usrControl.id },
  });

  console.log('✅ Personal creado');

  const tutor = await prisma.tutor.upsert({
    where: { idUsuario: usrTutor.id },
    update: {},
    create: {
      nombreCompleto: 'Lucía Pérez Morales',
      idUsuario: usrTutor.id,
      telefono: '5512345678',
      correo: 'tutor@demo.com',
    },
  });

  console.log('✅ Tutor creado');

  const periodo = await prisma.periodoEscolar.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nombre: '2025-2026',
      fechaInicio: new Date('2025-08-01'),
      fechaFin: new Date('2026-07-31'),
      activo: true,
    },
  });

  const periodoEval = await prisma.periodoEvaluacion.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nombre: 'Primer Parcial',
      fechaInicio: new Date('2026-01-01'),
      fechaFin: new Date('2026-02-28'),
    },
  });

  console.log('✅ Periodos creados');

  const grupo1A = await prisma.grupo.upsert({
    where: { nombre: '1°A' },
    update: {},
    create: { nombre: '1°A', grado: 1, seccion: 'A' },
  });

  const grupo2B = await prisma.grupo.upsert({
    where: { nombre: '2°B' },
    update: {},
    create: { nombre: '2°B', grado: 2, seccion: 'B' },
  });

  const grupo3C = await prisma.grupo.upsert({
    where: { nombre: '3°C' },
    update: {},
    create: { nombre: '3°C', grado: 3, seccion: 'C' },
  });

  console.log('✅ Grupos creados');

  const matMat = await prisma.materia.upsert({
    where: { nombre: 'Matemáticas' },
    update: {},
    create: { nombre: 'Matemáticas', clave: 'MAT-01' },
  });

  const matEsp = await prisma.materia.upsert({
    where: { nombre: 'Español' },
    update: {},
    create: { nombre: 'Español', clave: 'ESP-01' },
  });

  const matCiencias = await prisma.materia.upsert({
    where: { nombre: 'Ciencias' },
    update: {},
    create: { nombre: 'Ciencias', clave: 'CIE-01' },
  });

  console.log('✅ Materias creadas');

  const asignacionMat1A = await prisma.asignacion.upsert({
    where: {
      idDocente_idMateria_idGrupo: {
        idDocente: personalDocente.id,
        idMateria: matMat.id,
        idGrupo: grupo1A.id,
      },
    },
    update: {},
    create: {
      idDocente: personalDocente.id,
      idMateria: matMat.id,
      idGrupo: grupo1A.id,
    },
  });

  const asignacionEsp1A = await prisma.asignacion.upsert({
    where: {
      idDocente_idMateria_idGrupo: {
        idDocente: personalDocente.id,
        idMateria: matEsp.id,
        idGrupo: grupo1A.id,
      },
    },
    update: {},
    create: {
      idDocente: personalDocente.id,
      idMateria: matEsp.id,
      idGrupo: grupo1A.id,
    },
  });

  const asignacionCiencias3C = await prisma.asignacion.upsert({
    where: {
      idDocente_idMateria_idGrupo: {
        idDocente: personalDocente.id,
        idMateria: matCiencias.id,
        idGrupo: grupo3C.id,
      },
    },
    update: {},
    create: {
      idDocente: personalDocente.id,
      idMateria: matCiencias.id,
      idGrupo: grupo3C.id,
    },
  });

  console.log('✅ Asignaciones creadas');

  const alumno1 = await prisma.alumno.upsert({
    where: { matricula: '2025001' },
    update: {
      idTutor: tutor.id,
      idGrupo: grupo1A.id,
      puntosConducta: 90,
    },
    create: {
      nombreCompleto: 'Sofía Mendoza Rivera',
      matricula: '2025001',
      puntosConducta: 90,
      idGrupo: grupo1A.id,
      idTutor: tutor.id,
    },
  });

  const alumno2 = await prisma.alumno.upsert({
    where: { matricula: '2025002' },
    update: {
      idTutor: tutor.id,
      idGrupo: grupo1A.id,
      puntosConducta: 95,
    },
    create: {
      nombreCompleto: 'Diego Ramos Castro',
      matricula: '2025002',
      puntosConducta: 95,
      idGrupo: grupo1A.id,
      idTutor: tutor.id,
    },
  });

  const alumno3 = await prisma.alumno.upsert({
    where: { matricula: '2025003' },
    update: {
      idGrupo: grupo2B.id,
      puntosConducta: 95,
    },
    create: {
      nombreCompleto: 'Valentina Ortiz Fuentes',
      matricula: '2025003',
      puntosConducta: 95,
      idGrupo: grupo2B.id,
    },
  });

  const alumno4 = await prisma.alumno.upsert({
    where: { matricula: '2025004' },
    update: {
      idTutor: tutor.id,
      idGrupo: grupo3C.id,
      puntosConducta: 70,
    },
    create: {
      nombreCompleto: 'Emilio Vargas Peña',
      matricula: '2025004',
      puntosConducta: 70,
      idGrupo: grupo3C.id,
      idTutor: tutor.id,
    },
  });

  console.log('✅ Alumnos creados');

  const inscAlumno1 = await prisma.inscripcion.upsert({
    where: {
      idAlumno_idPeriodoEscolar: {
        idAlumno: alumno1.id,
        idPeriodoEscolar: periodo.id,
      },
    },
    update: { idGrupo: grupo1A.id, activa: true },
    create: {
      idAlumno: alumno1.id,
      idPeriodoEscolar: periodo.id,
      idGrupo: grupo1A.id,
      activa: true,
    },
  });

  const inscAlumno2 = await prisma.inscripcion.upsert({
    where: {
      idAlumno_idPeriodoEscolar: {
        idAlumno: alumno2.id,
        idPeriodoEscolar: periodo.id,
      },
    },
    update: { idGrupo: grupo1A.id, activa: true },
    create: {
      idAlumno: alumno2.id,
      idPeriodoEscolar: periodo.id,
      idGrupo: grupo1A.id,
      activa: true,
    },
  });

  await prisma.inscripcion.upsert({
    where: {
      idAlumno_idPeriodoEscolar: {
        idAlumno: alumno3.id,
        idPeriodoEscolar: periodo.id,
      },
    },
    update: { idGrupo: grupo2B.id, activa: true },
    create: {
      idAlumno: alumno3.id,
      idPeriodoEscolar: periodo.id,
      idGrupo: grupo2B.id,
      activa: true,
    },
  });

  const inscAlumno4 = await prisma.inscripcion.upsert({
    where: {
      idAlumno_idPeriodoEscolar: {
        idAlumno: alumno4.id,
        idPeriodoEscolar: periodo.id,
      },
    },
    update: { idGrupo: grupo3C.id, activa: true },
    create: {
      idAlumno: alumno4.id,
      idPeriodoEscolar: periodo.id,
      idGrupo: grupo3C.id,
      activa: true,
    },
  });

  console.log('✅ Inscripciones creadas');

  await prisma.horario.createMany({
    data: [
      { idAsignacion: asignacionMat1A.id, dia: 'LUNES', numeroClase: 1, salon: 'A1' },
      { idAsignacion: asignacionEsp1A.id, dia: 'LUNES', numeroClase: 2, salon: 'A1' },
      { idAsignacion: asignacionMat1A.id, dia: 'MIERCOLES', numeroClase: 3, salon: 'A1' },
      { idAsignacion: asignacionEsp1A.id, dia: 'VIERNES', numeroClase: 4, salon: 'A1' },
      { idAsignacion: asignacionCiencias3C.id, dia: 'MARTES', numeroClase: 1, salon: 'C3' },
      { idAsignacion: asignacionCiencias3C.id, dia: 'JUEVES', numeroClase: 2, salon: 'C3' },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Horarios creados');

  await prisma.calificacion.createMany({
    data: [
      {
        idInscripcion: inscAlumno1.id,
        idAsignacion: asignacionMat1A.id,
        idPeriodo: periodoEval.id,
        calificacion: 9.5,
      },
      {
        idInscripcion: inscAlumno1.id,
        idAsignacion: asignacionEsp1A.id,
        idPeriodo: periodoEval.id,
        calificacion: 8.7,
      },
      {
        idInscripcion: inscAlumno2.id,
        idAsignacion: asignacionMat1A.id,
        idPeriodo: periodoEval.id,
        calificacion: 7.8,
      },
      {
        idInscripcion: inscAlumno2.id,
        idAsignacion: asignacionEsp1A.id,
        idPeriodo: periodoEval.id,
        calificacion: 8.3,
      },
      {
        idInscripcion: inscAlumno4.id,
        idAsignacion: asignacionCiencias3C.id,
        idPeriodo: periodoEval.id,
        calificacion: 6.9,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Calificaciones creadas');

  await prisma.asistencia.createMany({
    data: [
      {
        idInscripcion: inscAlumno1.id,
        idAsignacion: asignacionMat1A.id,
        fecha: new Date('2026-01-12'),
        estado: 'PRESENTE',
      },
      {
        idInscripcion: inscAlumno1.id,
        idAsignacion: asignacionEsp1A.id,
        fecha: new Date('2026-01-13'),
        estado: 'RETARDO',
      },
      {
        idInscripcion: inscAlumno2.id,
        idAsignacion: asignacionMat1A.id,
        fecha: new Date('2026-01-12'),
        estado: 'FALTA',
      },
      {
        idInscripcion: inscAlumno4.id,
        idAsignacion: asignacionCiencias3C.id,
        fecha: new Date('2026-01-14'),
        estado: 'FALTA',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Asistencias creadas');

  await prisma.reporte.createMany({
    data: [
      {
        idAlumno: alumno1.id,
        idInscripcion: inscAlumno1.id,
        idUsuarioReporta: usrDocente.id,
        tipo: 'NEGATIVO',
        gravedad: 'MEDIO',
        descripcion: 'No entregó tarea de Matemáticas.',
        puntosAntes: 100,
        puntosDespues: 90,
      },
      {
        idAlumno: alumno2.id,
        idInscripcion: inscAlumno2.id,
        idUsuarioReporta: usrDocente.id,
        tipo: 'POSITIVO',
        gravedad: 'MUY_POSITIVO',
        descripcion: 'Excelente participación en clase.',
        puntosAntes: 85,
        puntosDespues: 95,
      },
      {
        idAlumno: alumno4.id,
        idInscripcion: inscAlumno4.id,
        idUsuarioReporta: usrDocente.id,
        tipo: 'NEGATIVO',
        gravedad: 'GRAVE',
        descripcion: 'Acumuló faltas y requiere seguimiento del tutor.',
        puntosAntes: 80,
        puntosDespues: 70,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Reportes creados');

  await prisma.configuracionEscuela.upsert({
    where: { id: 1 },
    update: {
      nombre: 'Secundaria Técnica 177',
      director: 'Carlos Ramírez Vega',
    },
    create: {
      id: 1,
      nombre: 'Secundaria Técnica 177',
      director: 'Carlos Ramírez Vega',
      telefono: '951 123 4567',
      correo: 'contacto@secundaria177.edu.mx',
    },
  });

  console.log('✅ Configuración escuela creada');

  console.log('\n🎉 Seed completado exitosamente');
  console.log('\n📋 Usuarios de prueba');
  console.log('   admin           / 1234 → ADMIN');
  console.log('   directivo       / 1234 → DIRECTIVO');
  console.log('   docente         / 1234 → DOCENTE');
  console.log('   prefecto        / 1234 → PREFECTO');
  console.log('   secretaria      / 1234 → SECRETARIA');
  console.log('   control_escolar / 1234 → CONTROL_ESCOLAR');
  console.log('   tutor           / 1234 → TUTOR');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());