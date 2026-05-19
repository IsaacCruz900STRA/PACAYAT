// prisma/seed.js — Datos reales Secundaria Técnica 177 (ciclo 2025-2026)
// Ejecutar: node prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');
  const hash = await bcrypt.hash('1234', 10);

  // Limpiar horarios previos (se crean vía importación de PDF)
  await prisma.horario.deleteMany({});
  console.log('🗑️  Horarios borrados');

  // ── 1. USUARIOS ────────────────────────────────────────────────────────────
  const usrAdmin = await prisma.usuario.upsert({
    where: { username: 'admin' }, update: {},
    create: { username: 'admin', nombre: 'Administrador Sistema', password: hash, rol: 'ADMIN' },
  });
  const usrDirectivo = await prisma.usuario.upsert({
    where: { username: 'directivo' }, update: {},
    create: { username: 'directivo', nombre: 'Director General', password: hash, rol: 'DIRECTIVO' },
  });
  const usrPrefecto = await prisma.usuario.upsert({
    where: { username: 'prefecto' }, update: {},
    create: { username: 'prefecto', nombre: 'Juan Martínez Soto', password: hash, rol: 'PREFECTO' },
  });
  const usrSecretaria = await prisma.usuario.upsert({
    where: { username: 'secretaria' }, update: {},
    create: { username: 'secretaria', nombre: 'Rosa Hernández Cruz', password: hash, rol: 'SECRETARIA' },
  });
  const usrControl = await prisma.usuario.upsert({
    where: { username: 'control_escolar' }, update: {},
    create: { username: 'control_escolar', nombre: 'Pedro González Ruiz', password: hash, rol: 'CONTROL_ESCOLAR' },
  });

  // Docentes reales del horario
  const docentesDef = [
    { username:'silvia_laeyva',     nombre:'Silvia Nasshelly Laeyva Martell',   esp:'Ciencias',                  tel:'5512340001', correo:'s.laeyva@sec177.edu.mx'     },
    { username:'rosalinda_luna',    nombre:'Rosalinda Nancy Luna Gómez',         esp:'Inglés',                    tel:'5512340002', correo:'r.luna@sec177.edu.mx'        },
    { username:'maribel_jarmillo',  nombre:'Maribel Jarmillo Fernández',         esp:'Español',                   tel:'5512340003', correo:'m.jarmillo@sec177.edu.mx'    },
    { username:'aurora_andrade',    nombre:'Aurora Andrade Velasco',             esp:'Artes',                     tel:'5512340004', correo:'a.andrade@sec177.edu.mx'      },
    { username:'rodolfo_samario',   nombre:'Rodolfo Samario Aranda',             esp:'Matemáticas',               tel:'5512340005', correo:'r.samario@sec177.edu.mx'     },
    { username:'patricia_morales',  nombre:'Patricia Morales Símon',             esp:'Geografía e Historia',      tel:'5512340006', correo:'p.morales@sec177.edu.mx'     },
    { username:'irma_alcala',       nombre:'Irma C. Alcala Ortega',             esp:'Historia y FCE',            tel:'5512340007', correo:'i.alcala@sec177.edu.mx'      },
    { username:'jose_ramos',        nombre:'Jose Eduardo Ramos Garcia',          esp:'Formación Cívica y Ética',  tel:'5512340008', correo:'j.ramos@sec177.edu.mx'       },
    { username:'lissete_martin',    nombre:'Lissete Martin Bravo',               esp:'Turismo',                   tel:'5512340009', correo:'l.martin@sec177.edu.mx'      },
    { username:'lenin_hernandez',   nombre:'Lenin Hernández Orozco',             esp:'Educación Física',          tel:'5512340010', correo:'l.hernandez@sec177.edu.mx'   },
    { username:'rolando_matus',     nombre:'Rolando Matus Alvardo',              esp:'Informática',               tel:'5512340011', correo:'r.matus@sec177.edu.mx'       },
    { username:'nelly_fernandez',   nombre:'Nelly Fernandez Acosta',             esp:'Formación Cívica y Ética',  tel:'5512340012', correo:'n.fernandez@sec177.edu.mx'   },
    { username:'germain_ramirez',   nombre:'Germain Ramirez Paz',               esp:'Matemáticas y Electrónica', tel:'5512340013', correo:'g.ramirez@sec177.edu.mx'     },
    { username:'edith_vasquez',     nombre:'Edith Vásquez García',              esp:'Ciencias',                  tel:'5512340014', correo:'e.vasquez@sec177.edu.mx'     },
    { username:'jose_acevedo',      nombre:'Jose Manuel Acevedo Jacinto',        esp:'Contabilidad',              tel:'5512340015', correo:'j.acevedo@sec177.edu.mx'     },
    { username:'erick_paz',         nombre:'Erick Paz Gutierrez',               esp:'Diseño Gráfico',            tel:'5512340016', correo:'e.paz@sec177.edu.mx'         },
    { username:'tania_avendano',    nombre:'Tania Avendaño Martínez',           esp:'Inglés y Español',          tel:'5512340017', correo:'t.avendano@sec177.edu.mx'    },
    { username:'adai_vasquez',      nombre:'Adai Vasquez Avendaño',             esp:'Educación Física y Artes',  tel:'5512340018', correo:'a.vasquez@sec177.edu.mx'     },
    { username:'irwin_venegas',     nombre:'Irwin Aldeir Venegas Gómez',        esp:'Historia',                  tel:'5512340019', correo:'i.venegas@sec177.edu.mx'     },
    { username:'rohel_cruz',        nombre:'Rohel Cruz Calderon',               esp:'Diseño Industrial',         tel:'5512340020', correo:'r.cruz@sec177.edu.mx'        },
    { username:'octavio_cortes',    nombre:'Octavio Cortes Contreras',          esp:'Matemáticas',               tel:'5512340021', correo:'o.cortes@sec177.edu.mx'      },
    { username:'marco_garcia',      nombre:'Marco Antonio García Pérez',        esp:'Ciencias',                  tel:'5512340022', correo:'m.garcia@sec177.edu.mx'      },
    { username:'eusebio_perez',     nombre:'Eusebio Pérez Gutiérrez',          esp:'Español y Artes',           tel:'5512340023', correo:'e.perez@sec177.edu.mx'       },
    { username:'heliel_hernandez',  nombre:'Heliel Hernandez Mendoza',          esp:'Historia',                  tel:'5512340024', correo:'h.hernandez@sec177.edu.mx'  },
    { username:'brenda_garcia',     nombre:'Brenda García Prieto',              esp:'Español',                   tel:'5512340025', correo:'b.garcia@sec177.edu.mx'      },
    { username:'isidro_ramirez',    nombre:'Isidro Ramirez Martínez',          esp:'Ciencias',                  tel:'5512340026', correo:'i.ramirez@sec177.edu.mx'     },
    { username:'tanehi_hernandez',  nombre:'Tanehi Hernandez Perez',            esp:'Historia',                  tel:'5512340027', correo:'t.hernandez@sec177.edu.mx'   },
    { username:'yatziri_nava',      nombre:'Yatziri Nava Luciano',              esp:'Inglés y Español',          tel:'5512340028', correo:'y.nava@sec177.edu.mx'        },
    { username:'leticia_perez',     nombre:'Leticia E. Perez Angeles',          esp:'Matemáticas e Informática', tel:'5512340029', correo:'le.perez@sec177.edu.mx'      },
    { username:'yazmin_pena',       nombre:'Yazmin Peña Baños',                 esp:'Ciencias',                  tel:'5512340030', correo:'y.pena@sec177.edu.mx'        },
    { username:'guadalupe_sanchez', nombre:'Guadalupe Sánchez Cruz',            esp:'Español',                   tel:'5512340031', correo:'g.sanchez@sec177.edu.mx'     },
  ];

  const usrDocentes = {};
  for (const d of docentesDef) {
    usrDocentes[d.username] = await prisma.usuario.upsert({
      where: { username: d.username }, update: {},
      create: { username: d.username, nombre: d.nombre, password: hash, rol: 'DOCENTE' },
    });
  }

  // Tutores
  const usrTutor1 = await prisma.usuario.upsert({ where:{username:'tutor_lucia'},    update:{}, create:{username:'tutor_lucia',    nombre:'Lucía Pérez Morales',   password:hash, rol:'TUTOR'} });
  const usrTutor2 = await prisma.usuario.upsert({ where:{username:'tutor_miguel'},   update:{}, create:{username:'tutor_miguel',   nombre:'Miguel Torres Vega',    password:hash, rol:'TUTOR'} });
  const usrTutor3 = await prisma.usuario.upsert({ where:{username:'tutor_patricia'}, update:{}, create:{username:'tutor_patricia', nombre:'Patricia Fuentes Ríos', password:hash, rol:'TUTOR'} });

  console.log('✅ Usuarios creados');

  // ── 2. PERSONAL ────────────────────────────────────────────────────────────
  await prisma.personal.upsert({ where:{idUsuario:usrAdmin.id},     update:{}, create:{nombre:'Administrador Sistema', rol:'ADMIN',          idUsuario:usrAdmin.id} });
  await prisma.personal.upsert({ where:{idUsuario:usrDirectivo.id}, update:{}, create:{nombre:'Director General',      rol:'DIRECTIVO',      idUsuario:usrDirectivo.id} });
  await prisma.personal.upsert({ where:{idUsuario:usrPrefecto.id},  update:{}, create:{nombre:'Juan Martínez Soto',    rol:'PREFECTO',       telefono:'5512345004', correo:'prefecto@sec177.edu.mx',        idUsuario:usrPrefecto.id} });
  await prisma.personal.upsert({ where:{idUsuario:usrSecretaria.id},update:{}, create:{nombre:'Rosa Hernández Cruz',   rol:'SECRETARIA',     telefono:'5512345005', correo:'secretaria@sec177.edu.mx',      idUsuario:usrSecretaria.id} });
  await prisma.personal.upsert({ where:{idUsuario:usrControl.id},   update:{}, create:{nombre:'Pedro González Ruiz',  rol:'CONTROL_ESCOLAR',telefono:'5512345006', correo:'control@sec177.edu.mx',          idUsuario:usrControl.id} });

  const pDocente = {};
  for (const d of docentesDef) {
    pDocente[d.username] = await prisma.personal.upsert({
      where: { idUsuario: usrDocentes[d.username].id }, update: {},
      create: { nombre: d.nombre, rol: 'DOCENTE', especialidad: d.esp, telefono: d.tel, correo: d.correo, idUsuario: usrDocentes[d.username].id },
    });
  }

  console.log('✅ Personal creado');

  // ── 3. TUTORES ─────────────────────────────────────────────────────────────
  const tutor1 = await prisma.tutor.upsert({ where:{idUsuario:usrTutor1.id}, update:{}, create:{nombreCompleto:'Lucía Pérez Morales',   telefono:'5598761001', correo:'lucia.perez@gmail.com',    idUsuario:usrTutor1.id} });
  const tutor2 = await prisma.tutor.upsert({ where:{idUsuario:usrTutor2.id}, update:{}, create:{nombreCompleto:'Miguel Torres Vega',    telefono:'5598761002', correo:'miguel.torres@gmail.com',  idUsuario:usrTutor2.id} });
  const tutor3 = await prisma.tutor.upsert({ where:{idUsuario:usrTutor3.id}, update:{}, create:{nombreCompleto:'Patricia Fuentes Ríos', telefono:'5598761003', correo:'patricia.fuentes@gmail.com',idUsuario:usrTutor3.id} });

  // ── 4. PERIODO ESCOLAR ─────────────────────────────────────────────────────
  const periodoEscolar = await prisma.periodoEscolar.upsert({
    where:{id:1}, update:{},
    create:{id:1, nombre:'2025-2026', fechaInicio:new Date('2025-08-25'), fechaFin:new Date('2026-07-10'), activo:true},
  });

  // ── 5. PERIODOS DE EVALUACIÓN ──────────────────────────────────────────────
  const p1 = await prisma.periodoEvaluacion.upsert({ where:{id:1}, update:{}, create:{id:1, nombre:'Parcial 1', fechaInicio:new Date('2025-08-25'), fechaFin:new Date('2025-11-07')} });
  const p2 = await prisma.periodoEvaluacion.upsert({ where:{id:2}, update:{}, create:{id:2, nombre:'Parcial 2', fechaInicio:new Date('2025-11-10'), fechaFin:new Date('2026-03-06')} });
  const p3 = await prisma.periodoEvaluacion.upsert({ where:{id:3}, update:{}, create:{id:3, nombre:'Parcial 3', fechaInicio:new Date('2026-03-09'), fechaFin:new Date('2026-07-10')} });

  console.log('✅ Periodos creados');

  // ── 6. GRUPOS (27 grupos A-I por grado) ───────────────────────────────────
  const upsertGrupo = (nombre, grado, seccion) =>
    prisma.grupo.upsert({ where:{nombre}, update:{}, create:{nombre, grado, seccion} });

  const G = {};
  for (const sec of ['A','B','C','D','E','F','G','H','I']) {
    G[`g1${sec}`] = await upsertGrupo(`1°${sec}`, 1, sec);
    G[`g2${sec}`] = await upsertGrupo(`2°${sec}`, 2, sec);
    G[`g3${sec}`] = await upsertGrupo(`3°${sec}`, 3, sec);
  }
  console.log('✅ 27 Grupos creados');

  // ── 7. MATERIAS ────────────────────────────────────────────────────────────
  const uM = (nombre, grado, clave) =>
    prisma.materia.upsert({ where:{nombre_grado:{nombre, grado}}, update:{}, create:{nombre, grado, clave} });

  const M = {};
  M.cie1=await uM('Ciencias I',                  1,'CIE-1'); M.esp1=await uM('Español',                     1,'ESP-1');
  M.mat1=await uM('Matemáticas',                 1,'MAT-1'); M.ing1=await uM('Inglés I',                    1,'ING-1');
  M.geo1=await uM('Geografía',                   1,'GEO-1'); M.his1=await uM('Historia I',                  1,'HIS-1');
  M.art1=await uM('Artes',                       1,'ART-1'); M.fce1=await uM('Formación Cívica y Ética I',  1,'FCE-1');
  M.edf1=await uM('Educación Física',            1,'EDF-1'); M.tur1=await uM('Turismo',                     1,'TUR-1');
  M.inf1=await uM('Informática',                 1,'INF-1'); M.ele1=await uM('Electrónica',                 1,'ELE-1');
  M.con1=await uM('Contabilidad',                1,'CON-1'); M.dgr1=await uM('Diseño Gráfico',              1,'DGR-1');
  M.din1=await uM('Diseño Industrial',           1,'DIN-1');

  M.cie2=await uM('Ciencias II',                 2,'CIE-2'); M.esp2=await uM('Español',                     2,'ESP-2');
  M.mat2=await uM('Matemáticas',                 2,'MAT-2'); M.ing2=await uM('Inglés II',                   2,'ING-2');
  M.his2=await uM('Historia II',                 2,'HIS-2'); M.art2=await uM('Artes',                       2,'ART-2');
  M.fce2=await uM('Formación Cívica y Ética II', 2,'FCE-2'); M.edf2=await uM('Educación Física',            2,'EDF-2');
  M.tur2=await uM('Turismo',                     2,'TUR-2'); M.inf2=await uM('Informática',                 2,'INF-2');
  M.ele2=await uM('Electrónica',                 2,'ELE-2'); M.con2=await uM('Contabilidad',                2,'CON-2');
  M.dgr2=await uM('Diseño Gráfico',              2,'DGR-2'); M.din2=await uM('Diseño Industrial',           2,'DIN-2');

  M.cie3=await uM('Ciencias III',                3,'CIE-3'); M.esp3=await uM('Español',                     3,'ESP-3');
  M.mat3=await uM('Matemáticas',                 3,'MAT-3'); M.ing3=await uM('Inglés III',                  3,'ING-3');
  M.his3=await uM('Historia III',               3,'HIS-3'); M.art3=await uM('Artes',                       3,'ART-3');
  M.fce3=await uM('Formación Cívica y Ética III',3,'FCE-3'); M.edf3=await uM('Educación Física',            3,'EDF-3');
  M.tur3=await uM('Turismo',                     3,'TUR-3'); M.inf3=await uM('Informática',                 3,'INF-3');
  M.ele3=await uM('Electrónica',                 3,'ELE-3'); M.con3=await uM('Contabilidad',                3,'CON-3');
  M.dgr3=await uM('Diseño Gráfico',              3,'DGR-3'); M.din3=await uM('Diseño Industrial',           3,'DIN-3');

  console.log('✅ 44 Materias creadas');

  // ── 8. MATERIAS → DOCENTES ────────────────────────────────────────────────
  const setM = (u, ids) => prisma.personal.update({ where:{id:pDocente[u].id}, data:{materias:{set:ids.map(id=>({id}))}} });

  await setM('silvia_laeyva',     [M.cie1.id, M.cie2.id]);
  await setM('rosalinda_luna',    [M.ing1.id, M.ing2.id]);
  await setM('maribel_jarmillo',  [M.esp1.id]);
  await setM('aurora_andrade',    [M.art1.id, M.art2.id, M.art3.id]);
  await setM('rodolfo_samario',   [M.mat1.id, M.mat3.id]);
  await setM('patricia_morales',  [M.geo1.id, M.his1.id]);
  await setM('irma_alcala',       [M.his1.id, M.fce1.id]);
  await setM('jose_ramos',        [M.fce1.id, M.fce2.id, M.fce3.id]);
  await setM('lissete_martin',    [M.tur1.id, M.tur2.id, M.tur3.id]);
  await setM('lenin_hernandez',   [M.edf1.id, M.edf2.id, M.edf3.id]);
  await setM('rolando_matus',     [M.inf1.id, M.inf2.id, M.inf3.id]);
  await setM('nelly_fernandez',   [M.fce1.id, M.fce2.id, M.fce3.id]);
  await setM('germain_ramirez',   [M.mat1.id, M.mat2.id, M.ele1.id, M.ele2.id, M.ele3.id]);
  await setM('edith_vasquez',     [M.cie1.id, M.cie2.id, M.cie3.id]);
  await setM('jose_acevedo',      [M.con1.id, M.con2.id, M.con3.id]);
  await setM('erick_paz',         [M.dgr1.id, M.dgr2.id, M.dgr3.id]);
  await setM('tania_avendano',    [M.esp1.id, M.ing2.id, M.ing3.id]);
  await setM('adai_vasquez',      [M.edf1.id, M.edf2.id, M.edf3.id, M.art2.id, M.art3.id]);
  await setM('irwin_venegas',     [M.his1.id, M.his2.id, M.his3.id]);
  await setM('rohel_cruz',        [M.din1.id, M.din2.id, M.din3.id]);
  await setM('octavio_cortes',    [M.mat2.id, M.mat3.id]);
  await setM('marco_garcia',      [M.cie2.id, M.cie3.id]);
  await setM('eusebio_perez',     [M.esp2.id, M.art2.id]);
  await setM('heliel_hernandez',  [M.his2.id]);
  await setM('brenda_garcia',     [M.esp2.id, M.esp3.id]);
  await setM('isidro_ramirez',    [M.cie3.id]);
  await setM('tanehi_hernandez',  [M.his3.id]);
  await setM('yatziri_nava',      [M.ing3.id, M.esp1.id, M.esp2.id]);
  await setM('leticia_perez',     [M.mat1.id, M.mat2.id, M.mat3.id, M.inf1.id, M.inf3.id]);
  await setM('yazmin_pena',       [M.cie1.id, M.cie3.id]);
  await setM('guadalupe_sanchez', [M.esp3.id]);

  // ── 9. ASIGNACIONES ───────────────────────────────────────────────────────
  const A = {};
  const uA = async (key, u, matKey, gKey) => {
    A[key] = await prisma.asignacion.upsert({
      where:{idDocente_idMateria_idGrupo:{idDocente:pDocente[u].id, idMateria:M[matKey].id, idGrupo:G[gKey].id}},
      update:{}, create:{idDocente:pDocente[u].id, idMateria:M[matKey].id, idGrupo:G[gKey].id},
    });
  };

  // 1°A
  await uA('cie1_1A','silvia_laeyva','cie1','g1A'); await uA('ing1_1A','rosalinda_luna','ing1','g1A');
  await uA('esp1_1A','maribel_jarmillo','esp1','g1A'); await uA('art1_1A','aurora_andrade','art1','g1A');
  await uA('mat1_1A','rodolfo_samario','mat1','g1A'); await uA('geo1_1A','patricia_morales','geo1','g1A');
  await uA('his1_1A','irma_alcala','his1','g1A'); await uA('fce1_1A','jose_ramos','fce1','g1A');
  await uA('tur1_1A','lissete_martin','tur1','g1A'); await uA('edf1_1A','lenin_hernandez','edf1','g1A');
  // 1°B
  await uA('cie1_1B','silvia_laeyva','cie1','g1B'); await uA('ing1_1B','rosalinda_luna','ing1','g1B');
  await uA('esp1_1B','maribel_jarmillo','esp1','g1B'); await uA('art1_1B','aurora_andrade','art1','g1B');
  await uA('mat1_1B','rodolfo_samario','mat1','g1B'); await uA('geo1_1B','patricia_morales','geo1','g1B');
  await uA('his1_1B','irma_alcala','his1','g1B'); await uA('fce1_1B','nelly_fernandez','fce1','g1B');
  await uA('inf1_1B','rolando_matus','inf1','g1B'); await uA('edf1_1B','lenin_hernandez','edf1','g1B');
  // 1°C
  await uA('cie1_1C','silvia_laeyva','cie1','g1C'); await uA('ing1_1C','rosalinda_luna','ing1','g1C');
  await uA('esp1_1C','maribel_jarmillo','esp1','g1C'); await uA('art1_1C','aurora_andrade','art1','g1C');
  await uA('mat1_1C','germain_ramirez','mat1','g1C'); await uA('geo1_1C','patricia_morales','geo1','g1C');
  await uA('his1_1C','irma_alcala','his1','g1C'); await uA('fce1_1C','nelly_fernandez','fce1','g1C');
  await uA('ele1_1C','germain_ramirez','ele1','g1C'); await uA('edf1_1C','lenin_hernandez','edf1','g1C');
  // 1°D
  await uA('cie1_1D','edith_vasquez','cie1','g1D'); await uA('ing1_1D','rosalinda_luna','ing1','g1D');
  await uA('esp1_1D','maribel_jarmillo','esp1','g1D'); await uA('art1_1D','aurora_andrade','art1','g1D');
  await uA('mat1_1D','rodolfo_samario','mat1','g1D'); await uA('geo1_1D','patricia_morales','geo1','g1D');
  await uA('his1_1D','irma_alcala','his1','g1D'); await uA('fce1_1D','irma_alcala','fce1','g1D');
  await uA('con1_1D','jose_acevedo','con1','g1D'); await uA('edf1_1D','lenin_hernandez','edf1','g1D');
  // 1°E
  await uA('cie1_1E','edith_vasquez','cie1','g1E'); await uA('ing1_1E','rosalinda_luna','ing1','g1E');
  await uA('esp1_1E','maribel_jarmillo','esp1','g1E'); await uA('art1_1E','aurora_andrade','art1','g1E');
  await uA('mat1_1E','rodolfo_samario','mat1','g1E'); await uA('geo1_1E','patricia_morales','geo1','g1E');
  await uA('his1_1E','irma_alcala','his1','g1E'); await uA('fce1_1E','irma_alcala','fce1','g1E');
  await uA('dgr1_1E','erick_paz','dgr1','g1E'); await uA('edf1_1E','lenin_hernandez','edf1','g1E');
  // 1°F
  await uA('cie1_1F','edith_vasquez','cie1','g1F'); await uA('ing1_1F','rosalinda_luna','ing1','g1F');
  await uA('esp1_1F','tania_avendano','esp1','g1F'); await uA('art1_1F','aurora_andrade','art1','g1F');
  await uA('mat1_1F','germain_ramirez','mat1','g1F'); await uA('geo1_1F','patricia_morales','geo1','g1F');
  await uA('his1_1F','irwin_venegas','his1','g1F'); await uA('fce1_1F','irma_alcala','fce1','g1F');
  await uA('din1_1F','rohel_cruz','din1','g1F'); await uA('edf1_1F','adai_vasquez','edf1','g1F');
  // 1°G
  await uA('cie1_1G','edith_vasquez','cie1','g1G'); await uA('ing1_1G','rosalinda_luna','ing1','g1G');
  await uA('esp1_1G','yatziri_nava','esp1','g1G'); await uA('art1_1G','aurora_andrade','art1','g1G');
  await uA('mat1_1G','leticia_perez','mat1','g1G'); await uA('geo1_1G','patricia_morales','geo1','g1G');
  await uA('his1_1G','irwin_venegas','his1','g1G'); await uA('fce1_1G','irma_alcala','fce1','g1G');
  await uA('dgr1_1G','erick_paz','dgr1','g1G'); await uA('edf1_1G','adai_vasquez','edf1','g1G');
  // 1°H
  await uA('cie1_1H','yazmin_pena','cie1','g1H'); await uA('ing1_1H','rosalinda_luna','ing1','g1H');
  await uA('esp1_1H','yatziri_nava','esp1','g1H'); await uA('art1_1H','aurora_andrade','art1','g1H');
  await uA('mat1_1H','leticia_perez','mat1','g1H'); await uA('geo1_1H','irwin_venegas','geo1','g1H');
  await uA('his1_1H','patricia_morales','his1','g1H'); await uA('fce1_1H','irma_alcala','fce1','g1H');
  await uA('inf1_1H','leticia_perez','inf1','g1H'); await uA('edf1_1H','adai_vasquez','edf1','g1H');
  // 2°A
  await uA('cie2_2A','marco_garcia','cie2','g2A'); await uA('ing2_2A','tania_avendano','ing2','g2A');
  await uA('esp2_2A','brenda_garcia','esp2','g2A'); await uA('art2_2A','eusebio_perez','art2','g2A');
  await uA('mat2_2A','octavio_cortes','mat2','g2A'); await uA('his2_2A','irwin_venegas','his2','g2A');
  await uA('fce2_2A','jose_ramos','fce2','g2A'); await uA('tur2_2A','lissete_martin','tur2','g2A');
  await uA('edf2_2A','lenin_hernandez','edf2','g2A');
  // 2°B
  await uA('cie2_2B','marco_garcia','cie2','g2B'); await uA('ing2_2B','rosalinda_luna','ing2','g2B');
  await uA('esp2_2B','eusebio_perez','esp2','g2B'); await uA('art2_2B','eusebio_perez','art2','g2B');
  await uA('mat2_2B','octavio_cortes','mat2','g2B'); await uA('his2_2B','heliel_hernandez','his2','g2B');
  await uA('fce2_2B','jose_ramos','fce2','g2B'); await uA('inf2_2B','rolando_matus','inf2','g2B');
  await uA('edf2_2B','lenin_hernandez','edf2','g2B');
  // 2°C
  await uA('cie2_2C','marco_garcia','cie2','g2C'); await uA('ing2_2C','rosalinda_luna','ing2','g2C');
  await uA('esp2_2C','brenda_garcia','esp2','g2C'); await uA('art2_2C','eusebio_perez','art2','g2C');
  await uA('mat2_2C','octavio_cortes','mat2','g2C'); await uA('his2_2C','heliel_hernandez','his2','g2C');
  await uA('fce2_2C','jose_ramos','fce2','g2C'); await uA('ele2_2C','germain_ramirez','ele2','g2C');
  await uA('edf2_2C','lenin_hernandez','edf2','g2C');
  // 2°D
  await uA('cie2_2D','marco_garcia','cie2','g2D'); await uA('ing2_2D','rosalinda_luna','ing2','g2D');
  await uA('esp2_2D','brenda_garcia','esp2','g2D'); await uA('art2_2D','eusebio_perez','art2','g2D');
  await uA('mat2_2D','octavio_cortes','mat2','g2D'); await uA('his2_2D','heliel_hernandez','his2','g2D');
  await uA('fce2_2D','jose_ramos','fce2','g2D'); await uA('con2_2D','jose_acevedo','con2','g2D');
  await uA('edf2_2D','lenin_hernandez','edf2','g2D');
  // 2°E
  await uA('cie2_2E','silvia_laeyva','cie2','g2E'); await uA('ing2_2E','rosalinda_luna','ing2','g2E');
  await uA('esp2_2E','eusebio_perez','esp2','g2E'); await uA('art2_2E','eusebio_perez','art2','g2E');
  await uA('mat2_2E','germain_ramirez','mat2','g2E'); await uA('his2_2E','heliel_hernandez','his2','g2E');
  await uA('fce2_2E','nelly_fernandez','fce2','g2E'); await uA('dgr2_2E','erick_paz','dgr2','g2E');
  await uA('edf2_2E','lenin_hernandez','edf2','g2E');
  // 2°F
  await uA('cie2_2F','silvia_laeyva','cie2','g2F'); await uA('ing2_2F','rosalinda_luna','ing2','g2F');
  await uA('esp2_2F','brenda_garcia','esp2','g2F'); await uA('art2_2F','eusebio_perez','art2','g2F');
  await uA('mat2_2F','germain_ramirez','mat2','g2F'); await uA('his2_2F','heliel_hernandez','his2','g2F');
  await uA('fce2_2F','nelly_fernandez','fce2','g2F'); await uA('din2_2F','rohel_cruz','din2','g2F');
  await uA('edf2_2F','lenin_hernandez','edf2','g2F');
  // 2°G
  await uA('cie2_2G','marco_garcia','cie2','g2G'); await uA('ing2_2G','tania_avendano','ing2','g2G');
  await uA('esp2_2G','eusebio_perez','esp2','g2G'); await uA('art2_2G','adai_vasquez','art2','g2G');
  await uA('mat2_2G','leticia_perez','mat2','g2G'); await uA('his2_2G','heliel_hernandez','his2','g2G');
  await uA('fce2_2G','nelly_fernandez','fce2','g2G'); await uA('dgr2_2G','erick_paz','dgr2','g2G');
  await uA('edf2_2G','adai_vasquez','edf2','g2G');
  // 2°H
  await uA('cie2_2H','marco_garcia','cie2','g2H'); await uA('ing2_2H','rosalinda_luna','ing2','g2H');
  await uA('esp2_2H','eusebio_perez','esp2','g2H'); await uA('art2_2H','adai_vasquez','art2','g2H');
  await uA('mat2_2H','leticia_perez','mat2','g2H'); await uA('his2_2H','heliel_hernandez','his2','g2H');
  await uA('fce2_2H','nelly_fernandez','fce2','g2H'); await uA('inf2_2H','rolando_matus','inf2','g2H');
  await uA('edf2_2H','adai_vasquez','edf2','g2H');
  // 3°A
  await uA('cie3_3A','marco_garcia','cie3','g3A'); await uA('ing3_3A','tania_avendano','ing3','g3A');
  await uA('esp3_3A','brenda_garcia','esp3','g3A'); await uA('art3_3A','aurora_andrade','art3','g3A');
  await uA('mat3_3A','octavio_cortes','mat3','g3A'); await uA('his3_3A','tanehi_hernandez','his3','g3A');
  await uA('fce3_3A','jose_ramos','fce3','g3A'); await uA('tur3_3A','lissete_martin','tur3','g3A');
  await uA('edf3_3A','lenin_hernandez','edf3','g3A');
  // 3°B
  await uA('cie3_3B','isidro_ramirez','cie3','g3B'); await uA('ing3_3B','tania_avendano','ing3','g3B');
  await uA('esp3_3B','guadalupe_sanchez','esp3','g3B'); await uA('art3_3B','aurora_andrade','art3','g3B');
  await uA('mat3_3B','octavio_cortes','mat3','g3B'); await uA('his3_3B','tanehi_hernandez','his3','g3B');
  await uA('fce3_3B','jose_ramos','fce3','g3B'); await uA('inf3_3B','rolando_matus','inf3','g3B');
  await uA('edf3_3B','lenin_hernandez','edf3','g3B');
  // 3°C
  await uA('cie3_3C','isidro_ramirez','cie3','g3C'); await uA('ing3_3C','tania_avendano','ing3','g3C');
  await uA('esp3_3C','guadalupe_sanchez','esp3','g3C'); await uA('art3_3C','aurora_andrade','art3','g3C');
  await uA('mat3_3C','octavio_cortes','mat3','g3C'); await uA('his3_3C','tanehi_hernandez','his3','g3C');
  await uA('fce3_3C','jose_ramos','fce3','g3C'); await uA('ele3_3C','germain_ramirez','ele3','g3C');
  await uA('edf3_3C','lenin_hernandez','edf3','g3C');
  // 3°D
  await uA('cie3_3D','isidro_ramirez','cie3','g3D'); await uA('ing3_3D','tania_avendano','ing3','g3D');
  await uA('esp3_3D','guadalupe_sanchez','esp3','g3D'); await uA('art3_3D','aurora_andrade','art3','g3D');
  await uA('mat3_3D','octavio_cortes','mat3','g3D'); await uA('his3_3D','tanehi_hernandez','his3','g3D');
  await uA('fce3_3D','jose_ramos','fce3','g3D'); await uA('con3_3D','jose_acevedo','con3','g3D');
  await uA('edf3_3D','lenin_hernandez','edf3','g3D');
  // 3°E
  await uA('cie3_3E','isidro_ramirez','cie3','g3E'); await uA('ing3_3E','tania_avendano','ing3','g3E');
  await uA('esp3_3E','guadalupe_sanchez','esp3','g3E'); await uA('art3_3E','aurora_andrade','art3','g3E');
  await uA('mat3_3E','rodolfo_samario','mat3','g3E'); await uA('his3_3E','tanehi_hernandez','his3','g3E');
  await uA('fce3_3E','jose_ramos','fce3','g3E'); await uA('dgr3_3E','erick_paz','dgr3','g3E');
  await uA('edf3_3E','lenin_hernandez','edf3','g3E');
  // 3°F
  await uA('cie3_3F','isidro_ramirez','cie3','g3F'); await uA('ing3_3F','yatziri_nava','ing3','g3F');
  await uA('esp3_3F','guadalupe_sanchez','esp3','g3F'); await uA('art3_3F','aurora_andrade','art3','g3F');
  await uA('mat3_3F','rodolfo_samario','mat3','g3F'); await uA('his3_3F','irwin_venegas','his3','g3F');
  await uA('fce3_3F','jose_ramos','fce3','g3F'); await uA('din3_3F','rohel_cruz','din3','g3F');
  await uA('edf3_3F','lenin_hernandez','edf3','g3F');
  // 3°G
  await uA('cie3_3G','isidro_ramirez','cie3','g3G'); await uA('ing3_3G','yatziri_nava','ing3','g3G');
  await uA('esp3_3G','guadalupe_sanchez','esp3','g3G'); await uA('art3_3G','aurora_andrade','art3','g3G');
  await uA('mat3_3G','leticia_perez','mat3','g3G'); await uA('his3_3G','irwin_venegas','his3','g3G');
  await uA('fce3_3G','nelly_fernandez','fce3','g3G'); await uA('dgr3_3G','erick_paz','dgr3','g3G');
  await uA('edf3_3G','adai_vasquez','edf3','g3G');
  // 3°H
  await uA('cie3_3H','yazmin_pena','cie3','g3H'); await uA('ing3_3H','yatziri_nava','ing3','g3H');
  await uA('esp3_3H','guadalupe_sanchez','esp3','g3H'); await uA('art3_3H','adai_vasquez','art3','g3H');
  await uA('mat3_3H','leticia_perez','mat3','g3H'); await uA('his3_3H','irwin_venegas','his3','g3H');
  await uA('fce3_3H','nelly_fernandez','fce3','g3H'); await uA('din3_3H','rohel_cruz','din3','g3H');
  await uA('edf3_3H','adai_vasquez','edf3','g3H');
  // 3°I
  await uA('cie3_3I','isidro_ramirez','cie3','g3I'); await uA('ing3_3I','yatziri_nava','ing3','g3I');
  await uA('esp3_3I','guadalupe_sanchez','esp3','g3I'); await uA('art3_3I','adai_vasquez','art3','g3I');
  await uA('mat3_3I','leticia_perez','mat3','g3I'); await uA('his3_3I','irwin_venegas','his3','g3I');
  await uA('fce3_3I','nelly_fernandez','fce3','g3I'); await uA('inf3_3I','leticia_perez','inf3','g3I');
  await uA('edf3_3I','adai_vasquez','edf3','g3I');

  console.log('✅ ~250 Asignaciones creadas');

  // ── 10. ALUMNOS DE MUESTRA ────────────────────────────────────────────────
  const uAl = (data) => prisma.alumno.upsert({ where:{matricula:data.matricula}, update:{}, create:data });

  // 1°A — alumno de prueba accesible (para ver horario del grupo)
  const a1 = await uAl({ nombreCompleto:'Sofía Mendoza Rivera',   matricula:'2025001', curp:'MERS110205MDFNVF01', fechaNacimiento:new Date('2011-02-05'), puntosConducta:100, grado:1, idGrupo:G.g1A.id, idTutor:tutor1.id });
  const a2 = await uAl({ nombreCompleto:'Diego Ramos Castro',      matricula:'2025002', curp:'RACD110817HDFMSD01', fechaNacimiento:new Date('2011-08-17'), puntosConducta:90,  grado:1, idGrupo:G.g1A.id, idTutor:tutor2.id });
  const a3 = await uAl({ nombreCompleto:'Camila Reyes Olvera',     matricula:'2025003', curp:'REOC111103MDFYLM01', fechaNacimiento:new Date('2011-11-03'), puntosConducta:100, grado:1, idGrupo:G.g1A.id, idTutor:tutor1.id });
  // 1°B
  const a4 = await uAl({ nombreCompleto:'Valeria Ortiz Nuñez',     matricula:'2025004', curp:'ONVL110315MDFRTL01', fechaNacimiento:new Date('2011-03-15'), puntosConducta:100, grado:1, idGrupo:G.g1B.id, idTutor:tutor2.id });
  const a5 = await uAl({ nombreCompleto:'Rodrigo Salinas Torres',  matricula:'2025005', curp:'SATR111229HDFLDG01', fechaNacimiento:new Date('2011-12-29'), puntosConducta:95,  grado:1, idGrupo:G.g1B.id, idTutor:tutor3.id });
  // 2°A
  const a6 = await uAl({ nombreCompleto:'Valentina Ortiz Fuentes', matricula:'2024001', curp:'ORFV100519MDFRTL01', fechaNacimiento:new Date('2010-05-19'), puntosConducta:100, grado:2, idGrupo:G.g2A.id, idTutor:tutor3.id });
  const a7 = await uAl({ nombreCompleto:'Mateo Flores Jiménez',    matricula:'2024002', curp:'FLIM101010HDFLTR01', fechaNacimiento:new Date('2010-10-10'), puntosConducta:80,  grado:2, idGrupo:G.g2A.id, idTutor:tutor2.id });
  // 2°C
  const a8 = await uAl({ nombreCompleto:'Santiago Mora Leal',      matricula:'2024003', curp:'MALS100215HDFRNL01', fechaNacimiento:new Date('2010-02-15'), puntosConducta:100, grado:2, idGrupo:G.g2C.id, idTutor:tutor3.id });
  // 3°A
  const a9  = await uAl({ nombreCompleto:'Emilio Vargas Peña',     matricula:'2023001', curp:'VAPE090301HDFRGM01', fechaNacimiento:new Date('2009-03-01'), puntosConducta:100, grado:3, idGrupo:G.g3A.id, idTutor:tutor2.id });
  const a10 = await uAl({ nombreCompleto:'Renata Campos Vidal',    matricula:'2023002', curp:'CAVR090825MDFMLN01', fechaNacimiento:new Date('2009-08-25'), puntosConducta:95,  grado:3, idGrupo:G.g3A.id, idTutor:tutor3.id });
  // 3°C
  const a11 = await uAl({ nombreCompleto:'Fernanda Ríos Castillo', matricula:'2023003', curp:'RICF090418MDFSSL01', fechaNacimiento:new Date('2009-04-18'), puntosConducta:100, grado:3, idGrupo:G.g3C.id, idTutor:tutor2.id });
  const a12 = await uAl({ nombreCompleto:'Carlos Mendoza Bravo',   matricula:'2023004', curp:'MEBC090720HDFNRL01', fechaNacimiento:new Date('2009-07-20'), puntosConducta:85,  grado:3, idGrupo:G.g3C.id, idTutor:tutor3.id });

  console.log('✅ 12 Alumnos de muestra creados');

  // ── 11. INSCRIPCIONES ──────────────────────────────────────────────────────
  const uInsc = (idAlumno, idGrupo) => prisma.inscripcion.upsert({
    where:{idAlumno_idPeriodoEscolar:{idAlumno, idPeriodoEscolar:periodoEscolar.id}},
    update:{}, create:{idAlumno, idPeriodoEscolar:periodoEscolar.id, idGrupo, activa:true},
  });
  await Promise.all([
    uInsc(a1.id,G.g1A.id), uInsc(a2.id,G.g1A.id), uInsc(a3.id,G.g1A.id),
    uInsc(a4.id,G.g1B.id), uInsc(a5.id,G.g1B.id),
    uInsc(a6.id,G.g2A.id), uInsc(a7.id,G.g2A.id),
    uInsc(a8.id,G.g2C.id),
    uInsc(a9.id,G.g3A.id), uInsc(a10.id,G.g3A.id),
    uInsc(a11.id,G.g3C.id), uInsc(a12.id,G.g3C.id),
  ]);
  console.log('✅ Inscripciones creadas');

  // ── 12. AVISOS ─────────────────────────────────────────────────────────────
  await prisma.aviso.upsert({ where:{id:1}, update:{}, create:{tipo:'CONDUCTA',titulo:'Alerta conducta moderada',mensaje:'El alumno descendió a 70 puntos. Se recomienda reunión con tutor.',umbralPuntos:70,canales:['PLATAFORMA']} });
  await prisma.aviso.upsert({ where:{id:2}, update:{}, create:{tipo:'CONDUCTA',titulo:'Alerta conducta grave',mensaje:'El alumno descendió a 50 puntos. Requiere intervención urgente.',umbralPuntos:50,canales:['PLATAFORMA','CORREO']} });
  await prisma.aviso.upsert({ where:{id:3}, update:{}, create:{tipo:'GENERAL',titulo:'Reinscripción 2026-2027',mensaje:'El periodo de reinscripción abre del 1 al 31 de mayo.',umbralPuntos:null,canales:['PLATAFORMA']} });

  // ── 13. CONFIGURACIÓN ESCUELA ─────────────────────────────────────────────
  await prisma.configuracionEscuela.upsert({ where:{id:1}, update:{}, create:{id:1, nombre:'Secundaria Técnica 177', direccion:'Av. Revolución 500, Col. Centro, CDMX', telefono:'55 1234 5600', correo:'contacto@sec177.edu.mx', director:'Director General'} });

  console.log('\n🎉 Seed completado');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Contraseña de todos los usuarios: 1234');
  console.log('  admin / directivo / prefecto / secretaria');
  console.log('  control_escolar / tutor_lucia / tutor_miguel');
  console.log('  silvia_laeyva / rosalinda_luna / maribel_jarmillo');
  console.log('  rodolfo_samario / octavio_cortes / ... (31 docentes)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Horarios: vacíos → importa el PDF en Admin > Horarios');
}

main().catch(e => { console.error('❌', e); process.exit(1); }).finally(()=>prisma.$disconnect());
