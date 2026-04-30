// src/pages/docente/Horario.jsx
import { useState } from 'react';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/layout/PageHeader';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import ModalCrearReporte from '../../components/reportes/ModalCrearReporte';

// ── Estructura de horario ─────────────────────────────────────────
const HORAS = [
  { id: 1, label: '07:00 - 07:50' },
  { id: 2, label: '07:50 - 08:40' },
  { id: 3, label: '08:40 - 09:30' },
  { id: 'R', label: 'RECESO', receso: true },
  { id: 4, label: '09:50 - 10:40' },
  { id: 5, label: '10:40 - 11:30' },
  { id: 6, label: '11:30 - 12:20' },
  { id: 7, label: '12:20 - 13:10' },
];

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

const HORARIO_MOCK = {
  Lunes:     { 1: { materia: 'Matemáticas', grupo: '1° A', salon: 'A-01' },
               3: { materia: 'Álgebra',      grupo: '2° B', salon: 'B-03' },
               5: { materia: 'Geometría',    grupo: '3° A', salon: 'A-05' } },
  Martes:    { 2: { materia: 'Álgebra',      grupo: '2° B', salon: 'B-03' },
               4: { materia: 'Geometría',    grupo: '3° C', salon: 'C-02' },
               6: { materia: 'Matemáticas',  grupo: '1° A', salon: 'A-01' } },
  Miércoles: { 1: { materia: 'Geometría',    grupo: '3° A', salon: 'A-05' },
               3: { materia: 'Matemáticas',  grupo: '1° A', salon: 'A-01' },
               7: { materia: 'Álgebra',      grupo: '2° B', salon: 'B-03' } },
  Jueves:    { 2: { materia: 'Geometría',    grupo: '3° C', salon: 'C-02' },
               4: { materia: 'Geometría',    grupo: '3° A', salon: 'A-05' },
               6: { materia: 'Álgebra',      grupo: '2° B', salon: 'B-03' } },
  Viernes:   { 1: { materia: 'Matemáticas',  grupo: '1° A', salon: 'A-01' },
               3: { materia: 'Geometría',    grupo: '3° C', salon: 'C-02' },
               5: { materia: 'Geometría',    grupo: '3° A', salon: 'A-05' } },
};

const MATERIA_COLORS = {
  'Matemáticas': { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af' },
  'Álgebra':     { bg: '#dcfce7', border: '#86efac', text: '#14532d' },
  'Geometría':   { bg: '#f3e8ff', border: '#d8b4fe', text: '#6b21a8' },
};

// ── Datos mock de alumnos por grupo ──────────────────────────────
const ALUMNOS_POR_GRUPO = {
  '1° A': [
    { id: 101, numero: 1,  nombre: 'Ana García López',         matricula: '24A001', puntosConducta: 88, curp: 'GALA100505MDFRCN01', fechaNac: '2010-05-05', domicilio: 'Calle Rosal 45, Col. Centro', tutorNombre: 'María López Sánchez',   tutorTel: '5512345678', tutorCorreo: 'maria@email.com' },
    { id: 102, numero: 2,  nombre: 'Carlos Ramírez Soto',      matricula: '24A002', puntosConducta: 72, curp: 'RASC100812HDFMTR02', fechaNac: '2010-08-12', domicilio: 'Av. Pino 22, Col. Norte',    tutorNombre: 'Pedro Ramírez Ruiz',    tutorTel: '5587654321', tutorCorreo: 'pedro@email.com' },
    { id: 103, numero: 3,  nombre: 'Diana Torres Ruiz',        matricula: '24A003', puntosConducta: 95, curp: 'TORD100203MDFRZN03', fechaNac: '2010-02-03', domicilio: 'Paseo del Álamo 8',          tutorNombre: 'Laura Ruiz Mendoza',    tutorTel: '5511223344', tutorCorreo: 'laura@email.com' },
    { id: 104, numero: 4,  nombre: 'Emilio Hernández Cruz',    matricula: '24A004', puntosConducta: 60, curp: 'HECE101130HDFRNM04', fechaNac: '2010-11-30', domicilio: 'Calle Olivo 3, Col. Sur',    tutorNombre: 'Rosa Cruz Jiménez',     tutorTel: '5544332211', tutorCorreo: 'rosa@email.com' },
    { id: 105, numero: 5,  nombre: 'Fernanda Morales Díaz',    matricula: '24A005', puntosConducta: 84, curp: 'MODF100718MDFRLN05', fechaNac: '2010-07-18', domicilio: 'Av. Cedro 101',              tutorNombre: 'Gustavo Morales Pérez', tutorTel: '5599887766', tutorCorreo: 'gustavo@email.com' },
    { id: 106, numero: 6,  nombre: 'Jesús Pérez González',     matricula: '24A006', puntosConducta: 55, curp: 'PEGJ100425HDFRNZ06', fechaNac: '2010-04-25', domicilio: 'Retorno 5, Col. Oriente',   tutorNombre: 'Carmen González Ríos',  tutorTel: '5566778899', tutorCorreo: 'carmen@email.com' },
    { id: 107, numero: 7,  nombre: 'Karla Jiménez Castro',     matricula: '24A007', puntosConducta: 91, curp: 'JICK100901MDFMSR07', fechaNac: '2010-09-01', domicilio: 'Calle Pino 77',              tutorNombre: 'Roberto Castro Luna',   tutorTel: '5522334455', tutorCorreo: 'roberto@email.com' },
    { id: 108, numero: 8,  nombre: 'Luis Mendoza Vargas',      matricula: '24A008', puntosConducta: 78, curp: 'MEVL101021HDFRNS08', fechaNac: '2010-10-21', domicilio: 'Av. Roble 56',               tutorNombre: 'Silvia Vargas Flores',  tutorTel: '5533445566', tutorCorreo: 'silvia@email.com' },
  ],
  '2° B': [
    { id: 201, numero: 1,  nombre: 'Adriana Flores Reyes',     matricula: '24B001', puntosConducta: 80, curp: 'FORA091215MDFLYN01', fechaNac: '2009-12-15', domicilio: 'Calle Nogal 12',             tutorNombre: 'Jorge Flores Cano',     tutorTel: '5577889900', tutorCorreo: 'jorge@email.com' },
    { id: 202, numero: 2,  nombre: 'Benjamín Soto Martínez',   matricula: '24B002', puntosConducta: 65, curp: 'SOMB090307HDFTRN02', fechaNac: '2009-03-07', domicilio: 'Av. Encino 33',              tutorNombre: 'Patricia Martínez Sol', tutorTel: '5511002233', tutorCorreo: 'patricia@email.com' },
    { id: 203, numero: 3,  nombre: 'Claudia Vega Romero',      matricula: '24B003', puntosConducta: 93, curp: 'VERC090522MDFRML03', fechaNac: '2009-05-22', domicilio: 'Calle Ceiba 67',             tutorNombre: 'Manuel Vega Ortiz',     tutorTel: '5544556677', tutorCorreo: 'manuel@email.com' },
    { id: 204, numero: 4,  nombre: 'Daniel Ríos Gutiérrez',    matricula: '24B004', puntosConducta: 74, curp: 'RIGD090810HDFSTR04', fechaNac: '2009-08-10', domicilio: 'Paseo del Sauce 9',          tutorNombre: 'Alicia Gutiérrez Vega', tutorTel: '5588990011', tutorCorreo: 'alicia@email.com' },
    { id: 205, numero: 5,  nombre: 'Elena Castillo Núñez',     matricula: '24B005', puntosConducta: 86, curp: 'CANE091103MDFSTL05', fechaNac: '2009-11-03', domicilio: 'Calle Álamo 20',             tutorNombre: 'Ramón Castillo Ruiz',   tutorTel: '5522113344', tutorCorreo: 'ramon@email.com' },
    { id: 206, numero: 6,  nombre: 'Felipe López Cruz',        matricula: '24B006', puntosConducta: 48, curp: 'LOCF090616HDFRCP06', fechaNac: '2009-06-16', domicilio: 'Av. Fresno 45',              tutorNombre: 'Isabel Cruz Flores',    tutorTel: '5566009988', tutorCorreo: 'isabel@email.com' },
  ],
  '3° A': [
    { id: 301, numero: 1,  nombre: 'Gloria Reyes Moreno',      matricula: '24C001', puntosConducta: 90, curp: 'REMG080114MDFYRN01', fechaNac: '2008-01-14', domicilio: 'Calle Sauce 8',              tutorNombre: 'Hector Reyes Gómez',    tutorTel: '5599001122', tutorCorreo: 'hector@email.com' },
    { id: 302, numero: 2,  nombre: 'Hugo Navarro Salinas',     matricula: '24C002', puntosConducta: 70, curp: 'NASH080928HDFNLN02', fechaNac: '2008-09-28', domicilio: 'Retorno 12, Col. Sur',       tutorNombre: 'Verónica Salinas Ruiz', tutorTel: '5533224455', tutorCorreo: 'veronica@email.com' },
    { id: 303, numero: 3,  nombre: 'Ivonne Ortega Peña',       matricula: '24C003', puntosConducta: 82, curp: 'OEPI080603MDFRTN03', fechaNac: '2008-06-03', domicilio: 'Av. Pino 90',                tutorNombre: 'Fernando Ortega Cruz',  tutorTel: '5577116655', tutorCorreo: 'fernando@email.com' },
    { id: 304, numero: 4,  nombre: 'Javier Aguilar Torres',    matricula: '24C004', puntosConducta: 58, curp: 'AGTJ080417HDFGRR04', fechaNac: '2008-04-17', domicilio: 'Calle Roble 55',             tutorNombre: 'Marcela Torres Soto',   tutorTel: '5500112233', tutorCorreo: 'marcela@email.com' },
    { id: 305, numero: 5,  nombre: 'Laura Sánchez Díaz',       matricula: '24C005', puntosConducta: 97, curp: 'SADL080802MDFRNN05', fechaNac: '2008-08-02', domicilio: 'Paseo del Rosal 3',          tutorNombre: 'Eduardo Sánchez Pérez', tutorTel: '5544887766', tutorCorreo: 'eduardo@email.com' },
  ],
  '3° C': [
    { id: 401, numero: 1,  nombre: 'Marco Delgado Fuentes',    matricula: '24D001', puntosConducta: 63, curp: 'DEFM080205HDFGNR01', fechaNac: '2008-02-05', domicilio: 'Av. Cedro 78',               tutorNombre: 'Norma Fuentes López',   tutorTel: '5511334455', tutorCorreo: 'norma@email.com' },
    { id: 402, numero: 2,  nombre: 'Natalia Guerrero Ramos',   matricula: '24D002', puntosConducta: 88, curp: 'GURN080711MDFMRN02', fechaNac: '2008-07-11', domicilio: 'Calle Fresno 34',            tutorNombre: 'Oscar Guerrero Díaz',   tutorTel: '5588223344', tutorCorreo: 'oscar@email.com' },
    { id: 403, numero: 3,  nombre: 'Omar Ibarra Cano',         matricula: '24D003', puntosConducta: 44, curp: 'IACO081019HDFBRM03', fechaNac: '2008-10-19', domicilio: 'Retorno 8, Col. Norte',      tutorNombre: 'Lucia Cano Vargas',     tutorTel: '5566990011', tutorCorreo: 'lucia@email.com' },
    { id: 404, numero: 4,  nombre: 'Paola Juárez Medina',      matricula: '24D004', puntosConducta: 76, curp: 'JUMP080325MDFRDN04', fechaNac: '2008-03-25', domicilio: 'Av. Álamo 12',               tutorNombre: 'Arturo Medina Ríos',    tutorTel: '5533667788', tutorCorreo: 'arturo@email.com' },
    { id: 405, numero: 5,  nombre: 'Ricardo Lara Espinoza',    matricula: '24D005', puntosConducta: 79, curp: 'LAER080514HDFRNC05', fechaNac: '2008-05-14', domicilio: 'Calle Nogal 5',              tutorNombre: 'Sandra Espinoza Cruz',  tutorTel: '5500556677', tutorCorreo: 'sandra@email.com' },
  ],
};

// Calificaciones mock por alumno para la materia del docente
const CAL_MOCK = { 1: 8.5, 2: 7.0, 3: null };
const PERIODOS_MOCK = [
  { id: 1, nombre: 'Periodo 1', estado: 'CERRADO' },
  { id: 2, nombre: 'Periodo 2', estado: 'CERRADO' },
  { id: 3, nombre: 'Periodo 3', estado: 'ACTIVO'  },
];
const REPORTES_MOCK = [
  { tipo: 'NEGATIVO', descripcion: 'Falta de tarea repetida', gravedad: 'NO_GRAVE', delta: -2, fecha: '2026-03-10' },
  { tipo: 'POSITIVO', descripcion: 'Participación sobresaliente en clase', gravedad: 'MEDIANAMENTE', delta: +4, fecha: '2026-02-20' },
];

// ── Helpers visuales ──────────────────────────────────────────────
function puntosColor(pts) {
  if (pts <= 45) return { bg: '#fee2e2', fg: '#991b1b' };
  if (pts <= 65) return { bg: '#fef3c7', fg: '#92400e' };
  return { bg: '#dcfce7', fg: '#166534' };
}

function calColor(v) {
  if (v === null || v === undefined) return 'var(--text-muted)';
  if (v < 6)   return '#dc2626';
  if (v < 7.5) return '#d97706';
  return '#16a34a';
}

// ── Componente: Expediente de alumno (solo lectura) ───────────────
function ModalExpediente({ alumno, materia, onClose }) {
  if (!alumno) return null;
  const { bg: ptsBg, fg: ptsFg } = puntosColor(alumno.puntosConducta);

  const sectionTitle = (text) => (
    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
      {text}
    </div>
  );

  const infoRow = (label, value) => (
    <div key={label} style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{value || '—'}</div>
    </div>
  );

  return (
    <Modal open={true} onClose={onClose} title={`Expediente · ${alumno.nombre}`} width={620}>
      {/* Encabezado de alumno */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, padding: '12px 14px', background: '#f8fafc', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--green-700)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
          {alumno.nombre[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{alumno.nombre}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Matrícula: {alumno.matricula} · No. Lista: {alumno.numero}</div>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: ptsBg, color: ptsFg }}>
          {alumno.puntosConducta} pts conducta
        </span>
      </div>

      {/* Grid de información */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Datos personales */}
        <div>
          {sectionTitle('Datos personales')}
          {infoRow('Nombre completo', alumno.nombre)}
          {infoRow('Matrícula', alumno.matricula)}
          {infoRow('CURP', alumno.curp)}
          {infoRow('Fecha de nacimiento', alumno.fechaNac)}
          {infoRow('Domicilio', alumno.domicilio)}
        </div>

        {/* Tutor */}
        <div>
          {sectionTitle('Información del tutor')}
          {infoRow('Nombre', alumno.tutorNombre)}
          {infoRow('Teléfono', alumno.tutorTel)}
          {infoRow('Correo', alumno.tutorCorreo)}
        </div>
      </div>

      {/* Calificaciones — solo de la materia del docente */}
      <div style={{ marginBottom: '1.25rem' }}>
        {sectionTitle(`Calificaciones · ${materia}`)}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {PERIODOS_MOCK.map(p => {
            const cal = CAL_MOCK[p.id];
            return (
              <div key={p.id} style={{ flex: 1, minWidth: 100, padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center', background: '#fafafa' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{p.nombre}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: cal !== null ? calColor(cal) : 'var(--text-muted)' }}>
                  {cal !== null ? cal.toFixed(1) : '—'}
                </div>
                <div style={{ fontSize: 10, marginTop: 2, color: p.estado === 'ACTIVO' ? 'var(--green-700)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {p.estado === 'ACTIVO' ? 'Activo' : 'Cerrado'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historial de reportes */}
      <div>
        {sectionTitle('Historial de reportes')}
        {REPORTES_MOCK.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sin reportes registrados.</div>
        ) : REPORTES_MOCK.map((r, i) => {
          const esNeg = r.tipo === 'NEGATIVO';
          return (
            <div key={i} style={{
              borderLeft: `4px solid ${esNeg ? '#ef4444' : '#22c55e'}`,
              background: esNeg ? '#fef2f2' : '#f0fdf4',
              borderRadius: '0 var(--radius) var(--radius) 0',
              padding: '10px 12px', marginBottom: 8,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{r.descripcion}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{r.fecha}</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: esNeg ? '#dc2626' : '#16a34a', flexShrink: 0, marginLeft: 12 }}>
                {r.delta > 0 ? '+' : ''}{r.delta} pts
              </span>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

// ── Componente: Panel de lista de alumnos ─────────────────────────
function PanelGrupo({ celda, onClose }) {
  const [expediente, setExpediente] = useState(null);
  const [reporteOpen, setReporteOpen] = useState(false);

  const alumnos = ALUMNOS_POR_GRUPO[celda.grupo] || [];
  const colors = MATERIA_COLORS[celda.materia] || MATERIA_COLORS['Matemáticas'];

  const thSt = {
    padding: '9px 12px', fontSize: 12, fontWeight: 700,
    color: 'var(--text-secondary)', background: 'var(--green-50)',
    borderBottom: '1.5px solid var(--border)', textAlign: 'left',
    whiteSpace: 'nowrap',
  };
  const tdSt = {
    padding: '10px 12px', borderBottom: '1px solid var(--border)',
    fontSize: 13, verticalAlign: 'middle',
  };

  // El overlay del panel solo está activo cuando no hay sub-modal abierto.
  // Así los clics dentro del modal de expediente o de reporte no cierran el panel.
  const subModalOpen = Boolean(expediente) || reporteOpen;

  return (
    <>
      {/* Overlay — se desactiva cuando un sub-modal está encima */}
      <div
        onClick={subModalOpen ? undefined : onClose}
        style={{
          position: 'fixed', inset: 0,
          background: subModalOpen ? 'rgba(17,24,39,0.15)' : 'rgba(17,24,39,0.35)',
          zIndex: 500,
          pointerEvents: subModalOpen ? 'none' : 'auto',
        }}
      />

      {/* Panel lateral derecho */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(640px, 92vw)',
        background: '#fff', zIndex: 501,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.18)',
      }}>
        {/* Cabecera del panel */}
        <div style={{
          padding: '18px 20px', borderBottom: '1px solid var(--border)',
          background: colors.bg, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: colors.text }}>
                {celda.grupo} — {celda.materia}
              </div>
              <div style={{ fontSize: 13, color: colors.text, opacity: 0.75, marginTop: 2 }}>
                Salón {celda.salon} · {alumnos.length} alumnos inscritos
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {/* Botón Crear Reporte — único en el panel */}
              <button
                onClick={() => setReporteOpen(true)}
                style={{
                  padding: '8px 16px', borderRadius: 'var(--radius)',
                  background: 'var(--green-700)', color: '#fff',
                  border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                📋 Crear Reporte
              </button>
              <button
                onClick={onClose}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: '1.5px solid var(--border)', background: '#fff',
                  cursor: 'pointer', fontSize: 18, color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'inherit',
                }}
              >×</button>
            </div>
          </div>
        </div>

        {/* Tabla de alumnos */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
              <tr>
                <th style={{ ...thSt, width: 48, textAlign: 'center' }}>#</th>
                <th style={thSt}>Nombre</th>
                <th style={{ ...thSt, width: 110 }}>Matrícula</th>
                <th style={{ ...thSt, width: 120, textAlign: 'center' }}>Conducta</th>
                <th style={{ ...thSt, width: 130, textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map(alumno => {
                const { bg, fg } = puntosColor(alumno.puntosConducta);
                return (
                  <tr
                    key={alumno.id}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td style={{ ...tdSt, textAlign: 'center', fontWeight: 700, color: 'var(--text-muted)' }}>
                      {alumno.numero}
                    </td>
                    <td style={{ ...tdSt, fontWeight: 600 }}>{alumno.nombre}</td>
                    <td style={{ ...tdSt, fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      {alumno.matricula}
                    </td>
                    <td style={{ ...tdSt, textAlign: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: bg, color: fg }}>
                        {alumno.puntosConducta} pts
                      </span>
                    </td>
                    <td style={{ ...tdSt, textAlign: 'center' }}>
                      <button
                        onClick={() => setExpediente(alumno)}
                        style={{
                          padding: '5px 12px', borderRadius: 'var(--radius)',
                          border: '1.5px solid var(--border)', background: '#fff',
                          cursor: 'pointer', fontSize: 12, fontWeight: 600,
                          color: 'var(--green-700)', fontFamily: 'inherit',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--green-700)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = 'var(--green-700)'; }}
                      >
                        Ver expediente
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal expediente (solo lectura) */}
      {expediente && (
        <ModalExpediente
          alumno={expediente}
          materia={celda.materia}
          onClose={() => setExpediente(null)}
        />
      )}

      {/* Modal crear reporte */}
      <ModalCrearReporte
        open={reporteOpen}
        onClose={() => setReporteOpen(false)}
        onSuccess={() => setReporteOpen(false)}
      />
    </>
  );
}

// ── Página principal ──────────────────────────────────────────────
export default function Horario() {
  const [hover,        setHover]        = useState(null); // { dia, claseId }
  const [selectedCell, setSelectedCell] = useState(null); // { materia, grupo, salon }

  const totalClases = Object.values(HORARIO_MOCK).flatMap(d => Object.values(d)).length;

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader title="Mi Horario" subtitle="Semana actual · Ciclo 2025-2026" />

      {/* Resumen */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Clases por semana', value: totalClases },
          { label: 'Grupos asignados',  value: 4 },
          { label: 'Horas semanales',   value: `${totalClases * 50} min` },
        ].map(s => (
          <Card key={s.label} style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
        💡 Haz clic en cualquier clase para ver la lista de alumnos del grupo.
      </p>

      {/* Tabla de horario */}
      <Card style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr style={{ background: 'var(--green-50)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', width: 130, borderBottom: '1.5px solid var(--border)' }}>
                Hora
              </th>
              {DIAS.map(d => (
                <th key={d} style={{ padding: '12px 16px', textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--green-800)', borderBottom: '1.5px solid var(--border)', borderLeft: '1px solid var(--border)' }}>
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HORAS.map(hora => {
              if (hora.receso) {
                return (
                  <tr key="receso">
                    <td colSpan={6} style={{ padding: '8px 16px', background: '#f3f4f6', textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                      RECESO · 09:30 - 09:50
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={hora.id}>
                  <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                    {hora.label}
                  </td>
                  {DIAS.map(dia => {
                    const celda   = HORARIO_MOCK[dia]?.[hora.id];
                    const isHover = hover?.dia === dia && hover?.claseId === hora.id;
                    const colors  = celda ? (MATERIA_COLORS[celda.materia] || MATERIA_COLORS['Matemáticas']) : null;

                    return (
                      <td key={dia} style={{ padding: '8px', borderBottom: '1px solid var(--border)', borderLeft: '1px solid var(--border)', verticalAlign: 'top', height: 72 }}>
                        {celda ? (
                          <div
                            onClick={() => setSelectedCell(celda)}
                            onMouseEnter={() => setHover({ dia, claseId: hora.id })}
                            onMouseLeave={() => setHover(null)}
                            style={{
                              background: isHover ? colors.border : colors.bg,
                              border: `1.5px solid ${colors.border}`,
                              borderRadius: 'var(--radius)',
                              padding: '8px 10px', height: '100%',
                              cursor: 'pointer',
                              transition: 'background var(--transition)',
                              userSelect: 'none',
                            }}
                          >
                            <div style={{ fontSize: 13, fontWeight: 700, color: colors.text, marginBottom: 2 }}>
                              {celda.materia}
                            </div>
                            <div style={{ fontSize: 12, color: colors.text, opacity: 0.8 }}>{celda.grupo}</div>
                            <div style={{ fontSize: 11, color: colors.text, opacity: 0.65, marginTop: 2 }}>
                              Salón {celda.salon}
                            </div>
                            {isHover && (
                              <div style={{ fontSize: 10, color: colors.text, opacity: 0.9, marginTop: 4, fontWeight: 600 }}>
                                Ver alumnos →
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ height: '100%' }} />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Leyenda */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        {Object.entries(MATERIA_COLORS).map(([mat, c]) => (
          <div key={mat} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: c.bg, border: `1.5px solid ${c.border}` }} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{mat}</span>
          </div>
        ))}
      </div>

      {/* Panel lateral de alumnos */}
      {selectedCell && (
        <PanelGrupo
          celda={selectedCell}
          onClose={() => setSelectedCell(null)}
        />
      )}
    </div>
  );
}
