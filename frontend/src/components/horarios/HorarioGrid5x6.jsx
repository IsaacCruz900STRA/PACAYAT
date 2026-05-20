/**
 * HorarioGrid5x6
 * Cuadrícula interactiva 5 días × 6 bloques de 50 min.
 *
 * Props:
 *   grid        { Lunes: { 1: { materia, docente?, grupo?, salon }, ... }, ... }
 *   bloques     [{ numero, inicio, fin, label }]   ← viene del API
 *   receso      { inicio, fin, label }
 *   dias        ['Lunes', 'Martes', ...]
 *   modo        'alumno' | 'docente'
 *   titulo      string opcional (nombre del alumno/docente)
 *   subtitulo   string opcional (grupo/especialidad)
 *   estadisticas object opcional (solo docente)
 *   compact     boolean — reduce tamaño de celdas
 *   onCeldaClick  function(celda, dia, bloque) — opcional
 */

import { User, GraduationCap } from 'lucide-react';

const COLORES = [
  { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af' },
  { bg: '#dcfce7', border: '#86efac', text: '#14532d' },
  { bg: '#f3e8ff', border: '#d8b4fe', text: '#6b21a8' },
  { bg: '#ffedd5', border: '#fdba74', text: '#c2410c' },
  { bg: '#ccfbf1', border: '#5eead4', text: '#0f766e' },
  { bg: '#fef3c7', border: '#fcd34d', text: '#92400e' },
  { bg: '#fce7f3', border: '#f9a8d4', text: '#9d174d' },
  { bg: '#e0f2fe', border: '#7dd3fc', text: '#0369a1' },
];

function colorMat(mat) {
  let h = 0;
  for (const c of (mat || '')) h = (h * 31 + c.charCodeAt(0)) % COLORES.length;
  return COLORES[h];
}

export default function HorarioGrid5x6({
  grid       = {},
  bloques    = [],
  receso     = { inicio: '09:30', fin: '09:50', label: 'RECESO' },
  dias       = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
  modo       = 'alumno',
  titulo     = '',
  subtitulo  = '',
  estadisticas = null,
  compact    = false,
  onCeldaClick = null,
}) {
  const celdaH   = compact ? 62 : 76;
  const fontSize = compact ? 11 : 12;
  const padding  = compact ? '6px 8px' : '8px 10px';

  const thS = {
    padding:      compact ? '9px 10px' : '11px 14px',
    textAlign:    'center',
    fontSize:     compact ? 12 : 13,
    fontWeight:   700,
    color:        'var(--green-800)',
    background:   'var(--green-50)',
    borderBottom: '1.5px solid var(--border)',
    borderLeft:   '1px solid var(--border)',
    whiteSpace:   'nowrap',
  };

  // Materias únicas para leyenda
  const materiasUnicas = [
    ...new Set(
      dias.flatMap(d =>
        bloques.map(b => grid[d]?.[b.numero]?.materia).filter(Boolean)
      )
    ),
  ];

  return (
    <div>
      {/* Encabezado con título y estadísticas */}
      {(titulo || estadisticas) && (
        <div style={{
          background: 'linear-gradient(135deg, var(--green-800) 0%, var(--green-600) 100%)',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          padding: compact ? '10px 14px' : '14px 18px',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div>
            {titulo && (
              <div style={{ fontSize: compact ? 14 : 17, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                {modo === 'alumno' ? <User size={compact ? 14 : 17} /> : <GraduationCap size={compact ? 14 : 17} />} {titulo}
              </div>
            )}
            {subtitulo && (
              <div style={{ fontSize: compact ? 11 : 13, opacity: 0.85, marginTop: 2 }}>
                {subtitulo}
              </div>
            )}
          </div>

          {estadisticas && (
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                ['Clases/sem.', estadisticas.totalClasesSemana],
                ['Grupos',      estadisticas.totalGrupos],
                ['Horas/sem.',  `${Math.floor((estadisticas.horasSemanalesMin||0)/60)}h ${(estadisticas.horasSemanalesMin||0)%60}min`],
              ].map(([k, v]) => (
                <div key={k} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: compact ? 15 : 18, fontWeight: 800 }}>{v}</div>
                  <div style={{ fontSize: 10, opacity: 0.8 }}>{k}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabla */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr style={{ background: 'var(--green-50)' }}>
              <th style={{ ...thS, textAlign: 'left', borderLeft: 'none', width: compact ? 110 : 130 }}>
                Bloque / Hora
              </th>
              {dias.map(d => <th key={d} style={thS}>{d}</th>)}
            </tr>
          </thead>

          <tbody>
            {bloques.map((bloque, i) => (
              <>
                {/* Fila de receso entre bloque 3 y 4 */}
                {i === 3 && (
                  <tr key="receso">
                    <td colSpan={dias.length + 1} style={{
                      padding:    '6px 14px',
                      background: '#f3f4f6',
                      textAlign:  'center',
                      fontSize:   11,
                      fontWeight: 700,
                      color:      'var(--text-muted)',
                      letterSpacing: '0.07em',
                      borderTop:    '1px solid var(--border)',
                      borderBottom: '1px solid var(--border)',
                    }}>
                      RECESO &nbsp;·&nbsp; {receso.inicio} - {receso.fin}
                    </td>
                  </tr>
                )}

                <tr key={bloque.numero}>
                  {/* Columna de hora */}
                  <td style={{
                    padding:     compact ? '6px 10px' : '8px 14px',
                    borderBottom:'1px solid var(--border)',
                    background:  '#fafafa',
                    whiteSpace:  'nowrap',
                  }}>
                    <div style={{ fontSize: compact ? 10 : 11, fontWeight: 700, color: 'var(--green-700)', lineHeight: 1.3 }}>
                      Bloque {bloque.numero}
                    </div>
                    <div style={{ fontSize: compact ? 10 : 11, color: 'var(--text-muted)', marginTop: 1 }}>
                      {bloque.inicio} - {bloque.fin}
                    </div>
                  </td>

                  {/* Celdas de cada día */}
                  {dias.map(dia => {
                    const celda = grid[dia]?.[bloque.numero];
                    const col   = celda ? colorMat(celda.materia) : null;
                    const clickable = Boolean(onCeldaClick && celda);

                    return (
                      <td
                        key={dia}
                        onClick={() => clickable && onCeldaClick(celda, dia, bloque)}
                        style={{
                          padding:      6,
                          borderBottom: '1px solid var(--border)',
                          borderLeft:   '1px solid var(--border)',
                          verticalAlign:'top',
                          height:       celdaH,
                          cursor:       clickable ? 'pointer' : 'default',
                          transition:   'background 0.1s',
                        }}
                        onMouseEnter={e => { if (clickable) e.currentTarget.style.background = '#f8fafc'; }}
                        onMouseLeave={e => { if (clickable) e.currentTarget.style.background = ''; }}
                      >
                        {celda ? (
                          <div style={{
                            background:   col.bg,
                            border:       `1.5px solid ${col.border}`,
                            borderRadius: 'var(--radius)',
                            padding,
                            height:       '100%',
                            display:      'flex',
                            flexDirection:'column',
                            justifyContent: 'center',
                          }}>
                            <div style={{ fontSize: fontSize + 1, fontWeight: 700, color: col.text, lineHeight: 1.3 }}>
                              {celda.materia}
                            </div>
                            {modo === 'docente' && celda.grupo && (
                              <div style={{ fontSize, color: col.text, opacity: 0.85, marginTop: 2, fontWeight: 600 }}>
                                {celda.grupo}
                              </div>
                            )}
                            {modo === 'alumno' && celda.docente && (
                              <div style={{ fontSize: fontSize - 1, color: col.text, opacity: 0.75, marginTop: 2 }}>
                                {celda.docente}
                              </div>
                            )}
                            <div style={{ fontSize: fontSize - 1, color: col.text, opacity: 0.6, marginTop: 2 }}>
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
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Leyenda de materias */}
      {materiasUnicas.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: '10px 4px 4px' }}>
          {materiasUnicas.map(mat => {
            const c = colorMat(mat);
            return (
              <div key={mat} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 11, height: 11, borderRadius: 3, background: c.bg, border: `1.5px solid ${c.border}`, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{mat}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
