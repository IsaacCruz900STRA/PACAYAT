// src/pages/docente/Horario.jsx
import { useState } from 'react';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/layout/PageHeader';

// Clases: 7 periodos + 1 receso
const HORAS = [
  { id: 1, label: '07:00 - 07:50' },
  { id: 2, label: '07:50 - 08:40' },
  { id: 3, label: '08:40 - 09:30' },
  { id: 'R', label: 'RECESO',      receso: true },
  { id: 4, label: '09:50 - 10:40' },
  { id: 5, label: '10:40 - 11:30' },
  { id: 6, label: '11:30 - 12:20' },
  { id: 7, label: '12:20 - 13:10' },
];

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

// Mock del horario — celdas con asignación real
// Estructura: { [dia]: { [claseId]: { materia, grupo, salon } } }
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

// Color por materia
const MATERIA_COLORS = {
  'Matemáticas': { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af' },
  'Álgebra':     { bg: '#dcfce7', border: '#86efac', text: '#14532d' },
  'Geometría':   { bg: '#f3e8ff', border: '#d8b4fe', text: '#6b21a8' },
};

export default function Horario() {
  const [hover, setHover] = useState(null); // { dia, claseId }

  const totalClases = Object.values(HORARIO_MOCK)
    .flatMap(d => Object.values(d)).length;

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader
        title="Mi Horario"
        subtitle="Semana actual · Ciclo 2025-2026"
      />

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
                    <td colSpan={6} style={{
                      padding: '8px 16px', background: '#f3f4f6',
                      textAlign: 'center', fontSize: 12, fontWeight: 600,
                      color: 'var(--text-muted)', letterSpacing: '0.08em',
                      borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
                    }}>
                      RECESO · 09:30 - 09:50
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={hora.id}>
                  {/* Columna hora */}
                  <td style={{
                    padding: '10px 16px', fontSize: 12,
                    color: 'var(--text-secondary)', fontWeight: 500,
                    borderBottom: '1px solid var(--border)',
                    whiteSpace: 'nowrap',
                  }}>
                    {hora.label}
                  </td>

                  {/* Celdas por día */}
                  {DIAS.map(dia => {
                    const celda = HORARIO_MOCK[dia]?.[hora.id];
                    const isHover = hover?.dia === dia && hover?.claseId === hora.id;
                    const colors = celda ? (MATERIA_COLORS[celda.materia] || MATERIA_COLORS['Matemáticas']) : null;

                    return (
                      <td key={dia} style={{
                        padding: '8px',
                        borderBottom: '1px solid var(--border)',
                        borderLeft: '1px solid var(--border)',
                        verticalAlign: 'top',
                        height: 70,
                      }}>
                        {celda ? (
                          <div
                            onMouseEnter={() => setHover({ dia, claseId: hora.id })}
                            onMouseLeave={() => setHover(null)}
                            style={{
                              background: isHover ? colors.border : colors.bg,
                              border: `1.5px solid ${colors.border}`,
                              borderRadius: 'var(--radius)',
                              padding: '8px 10px', height: '100%',
                              cursor: 'default', transition: 'background var(--transition)',
                            }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: colors.text, marginBottom: 2 }}>
                              {celda.materia}
                            </div>
                            <div style={{ fontSize: 12, color: colors.text, opacity: 0.8 }}>
                              {celda.grupo}
                            </div>
                            <div style={{ fontSize: 11, color: colors.text, opacity: 0.65, marginTop: 2 }}>
                              Salón {celda.salon}
                            </div>
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
    </div>
  );
}
