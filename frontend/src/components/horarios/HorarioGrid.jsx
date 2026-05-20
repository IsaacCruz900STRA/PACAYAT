/**
 * HorarioGrid — Cuadrícula universal 9 bloques × 5 días.
 * Modos: 'grupo' (color por materia) | 'docente' (color por grupo)
 * Soporta drag & drop cuando editMode=true.
 */

import { useState, useRef, useCallback, Fragment } from 'react';
import { colorMateria, colorGrupo } from '../../utils/horarioColors';

export const BLOQUES_9 = [
  { numero:1, inicio:'07:00', fin:'07:50', label:'07:00 - 07:50' },
  { numero:2, inicio:'07:50', fin:'08:40', label:'07:50 - 08:40' },
  { numero:3, inicio:'08:40', fin:'09:30', label:'08:40 - 09:30' },
  { numero:4, inicio:'10:00', fin:'10:50', label:'10:00 - 10:50' },
  { numero:5, inicio:'10:50', fin:'11:40', label:'10:50 - 11:40' },
  { numero:6, inicio:'11:40', fin:'12:30', label:'11:40 - 12:30' },
  { numero:7, inicio:'12:30', fin:'13:20', label:'12:30 - 13:20' },
  { numero:8, inicio:'13:20', fin:'14:10', label:'13:20 - 14:10' },
  { numero:9, inicio:'14:10', fin:'15:00', label:'14:10 - 15:00' },
];
export const RECESO_9    = { inicio:'09:30', fin:'10:00', label:'RECESO' };
export const DIAS_DEFAULT = ['Lunes','Martes','Miércoles','Jueves','Viernes'];

function validarMov(assignments, item, dia, slot) {
  if (!item) return [];
  const enDest = assignments.filter(a => a.dia === dia && a.slot === slot && a.id !== item.id);
  const msgs = [];
  const cp = enDest.find(a => a.profesor_id === item.profesor_id);
  const cg = enDest.find(a => a.grupo_id    === item.grupo_id);
  const ca = enDest.find(a => a.aula_id === item.aula_id && item.aula_id && item.aula_id !== '—');
  if (cp) msgs.push(`${item.profesor_nombre} ya imparte "${cp.materia}" en ese bloque`);
  if (cg) msgs.push(`${item.grupo_nombre} ya tiene "${cg.materia}" en ese bloque`);
  if (ca) msgs.push(`Aula "${item.aula_nombre}" ya está ocupada en ese bloque`);
  return msgs;
}

export default function HorarioGrid({
  grid        = {},
  bloques     = BLOQUES_9,
  receso      = RECESO_9,
  dias        = DIAS_DEFAULT,
  modo        = 'grupo',
  editMode    = false,
  assignments = [],
  onMove      = null,
  onCeldaClick = null,
  compact      = false,
  titulo       = '',
  subtitulo    = '',
  estadisticas = null,
}) {
  const dragging  = useRef(null);
  const [isDrag,   setIsDrag]   = useState(false);
  const [dragOver, setDragOver] = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [toast,    setToast]    = useState(null);

  const showToast = useCallback((msgs) => {
    setToast(msgs);
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleDragStart = useCallback((e, item) => {
    dragging.current = item;
    setIsDrag(true);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    dragging.current = null;
    setIsDrag(false);
    setDragOver(null);
    setPreview(null);
  }, []);

  const handleDragOver = useCallback((e, dia, slot) => {
    e.preventDefault();
    if (!dragging.current) return;
    if (dragOver?.dia !== dia || dragOver?.slot !== slot) {
      setDragOver({ dia, slot });
      setPreview({ conflictos: validarMov(assignments, dragging.current, dia, slot) });
    }
  }, [dragOver, assignments]);

  const handleDrop = useCallback((e, dia, slot) => {
    e.preventDefault();
    if (!dragging.current) return;
    const c = validarMov(assignments, dragging.current, dia, slot);
    if (c.length > 0) {
      showToast(c);
    } else if (dragging.current.dia !== dia || dragging.current.slot !== slot) {
      onMove?.(dragging.current.id, dia, slot);
    }
    setDragOver(null);
    setPreview(null);
    dragging.current = null;
    setIsDrag(false);
  }, [assignments, onMove, showToast]);

  const materiasUnicas = modo === 'grupo'
    ? [...new Set(dias.flatMap(d => bloques.map(b => grid[d]?.[b.numero]?.materia).filter(Boolean)))]
    : [];

  const celdaH   = compact ? 58 : 70;
  const fontSz   = compact ? 11 : 12;
  const pad      = compact ? '5px 7px' : '6px 9px';
  const hasConflict = preview?.conflictos?.length > 0;

  const thStyle = {
    padding:      compact ? '8px 10px' : '10px 13px',
    textAlign:    'center',
    fontSize:     compact ? 11 : 13,
    fontWeight:   700,
    color:        'var(--green-800)',
    background:   'var(--green-50)',
    borderBottom: '1.5px solid var(--border)',
    borderLeft:   '1px solid var(--border)',
    whiteSpace:   'nowrap',
  };

  return (
    <div>
      {/* Encabezado */}
      {(titulo || estadisticas) && (
        <div style={{
          background:'linear-gradient(135deg,#1B5E30 0%,#2E7D32 100%)',
          borderRadius:'var(--radius-lg) var(--radius-lg) 0 0',
          padding: compact ? '10px 14px' : '14px 18px',
          color:'#fff', display:'flex', justifyContent:'space-between',
          alignItems:'center', flexWrap:'wrap', gap:12,
        }}>
          <div>
            {titulo    && <div style={{ fontSize:compact?14:17, fontWeight:700 }}>{modo==='grupo'?'👥':'🧑‍🏫'} {titulo}</div>}
            {subtitulo && <div style={{ fontSize:compact?11:13, opacity:.85, marginTop:2 }}>{subtitulo}</div>}
          </div>
          {estadisticas && (
            <div style={{ display:'flex', gap:18, flexWrap:'wrap' }}>
              {[
                ['Clases/sem', estadisticas.totalClasesSemana],
                ['Grupos',     estadisticas.totalGrupos],
                ['Horas/sem',  `${Math.floor((estadisticas.horasSemanalesMin||0)/60)}h ${(estadisticas.horasSemanalesMin||0)%60}m`],
              ].map(([k,v]) => (
                <div key={k} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:compact?16:20, fontWeight:800 }}>{v}</div>
                  <div style={{ fontSize:10, opacity:.8 }}>{k}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Toast conflicto */}
      {toast && (
        <div style={{ position:'sticky', top:0, zIndex:50, margin:'0 0 8px', padding:'10px 16px', background:'#fef2f2', border:'1.5px solid #fecaca', borderRadius:'var(--radius)', display:'flex', gap:10, alignItems:'flex-start' }}>
          <span style={{ fontSize:16 }}>🚫</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#dc2626' }}>Movimiento no permitido</div>
            {toast.map((m,i) => <div key={i} style={{ fontSize:12, color:'#991b1b', marginTop:2 }}>• {m}</div>)}
          </div>
          <button onClick={()=>setToast(null)} style={{ background:'none',border:'none',cursor:'pointer',fontSize:14,color:'#dc2626' }}>×</button>
        </div>
      )}

      {/* Preview durante drag */}
      {isDrag && dragOver && preview && (
        <div style={{
          position:'sticky', top:0, zIndex:40, margin:'0 0 6px', padding:'6px 14px',
          background: hasConflict ? '#fef2f2' : '#f0fdf4',
          border:`1.5px solid ${hasConflict ? '#fecaca':'#bbf7d0'}`,
          borderRadius:'var(--radius)', fontSize:13, display:'flex', alignItems:'center', gap:8,
        }}>
          <span>{hasConflict ? '🔴' : '🟢'}</span>
          <span style={{ fontWeight:600, color: hasConflict?'#dc2626':'#16a34a' }}>
            {hasConflict ? preview.conflictos[0] : 'Posición libre — suelta para confirmar'}
          </span>
        </div>
      )}

      {/* Tabla */}
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth: compact?560:700 }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, textAlign:'left', borderLeft:'none', width: compact?100:125 }}>Bloque</th>
              {dias.map(d => <th key={d} style={thStyle}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {/* Renderizado con flatMap para evitar problemas con Fragment + tbody */}
            {bloques.flatMap((bloque, i) => {
              const bloqueRow = (
                <tr key={`b${bloque.numero}`}>
                  {/* Hora */}
                  <td style={{ padding: compact?'5px 9px':'7px 12px', borderBottom:'1px solid var(--border)', background:'#fafafa', whiteSpace:'nowrap' }}>
                    <div style={{ fontSize: compact?10:11, fontWeight:700, color:'#1B7A3D', lineHeight:1.2 }}>
                      Bloque {bloque.numero}
                    </div>
                    <div style={{ fontSize: compact?9:10, color:'var(--text-muted)', marginTop:1 }}>
                      {bloque.inicio}–{bloque.fin}
                    </div>
                  </td>
                  {/* Celdas */}
                  {dias.map(dia => {
                    const celda    = grid[dia]?.[bloque.numero];
                    const isTarget = isDrag && dragOver?.dia === dia && dragOver?.slot === bloque.numero;
                    const conflicto = isTarget && hasConflict;
                    const valido    = isTarget && !hasConflict;
                    const col = celda
                      ? (modo === 'grupo' ? colorMateria(celda.materia) : colorGrupo(celda.grupo))
                      : null;
                    const esArrastrando = isDrag && celda && dragging.current?.id === celda.id;
                    const clickable = !editMode && Boolean(onCeldaClick) && Boolean(celda);

                    return (
                      <td key={dia}
                        onDragOver={editMode ? e => handleDragOver(e, dia, bloque.numero) : undefined}
                        onDrop={editMode ? e => handleDrop(e, dia, bloque.numero) : undefined}
                        onClick={clickable ? () => onCeldaClick(celda, dia, bloque) : undefined}
                        style={{
                          padding:6,
                          borderBottom:'1px solid var(--border)',
                          borderLeft:'1px solid var(--border)',
                          verticalAlign:'top',
                          height: celdaH,
                          cursor: clickable ? 'pointer' : 'default',
                          background: conflicto ? 'rgba(239,68,68,.07)' : valido ? 'rgba(22,163,74,.07)' : isDrag && editMode ? 'rgba(248,250,252,.85)' : undefined,
                          outline: isTarget ? `2px dashed ${conflicto ? '#ef4444' : '#16a34a'}` : undefined,
                          outlineOffset: '-2px',
                          transition:'background .1s',
                        }}
                      >
                        {celda ? (
                          <div
                            draggable={editMode}
                            onDragStart={editMode ? e => handleDragStart(e, celda) : undefined}
                            onDragEnd={editMode ? handleDragEnd : undefined}
                            title={`${celda.materia}${celda.docente ? ' · ' + celda.docente : ''}${celda.grupo ? ' · ' + celda.grupo : ''} · Salón ${celda.salon}`}
                            style={{
                              background:    esArrastrando ? '#e5e7eb' : col.bg,
                              border:        `1.5px solid ${col.border}`,
                              borderRadius:  'var(--radius)',
                              padding: pad,
                              height:        '100%',
                              cursor:        editMode ? 'grab' : 'default',
                              opacity:       esArrastrando ? .4 : 1,
                              userSelect:    'none',
                              display:       'flex',
                              flexDirection: 'column',
                              justifyContent:'center',
                              overflow:      'hidden',
                            }}
                          >
                            <div style={{ fontSize: fontSz+1, fontWeight:700, color:col.text, lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              {celda.materia}
                            </div>
                            {modo === 'docente' && celda.grupo && (
                              <div style={{ fontSize: fontSz, fontWeight:700, color:col.text, opacity:.9, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                {celda.grupo}
                              </div>
                            )}
                            {modo === 'grupo' && celda.docente && (
                              <div style={{ fontSize: fontSz-1, color:col.text, opacity:.7, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                {celda.docente}
                              </div>
                            )}
                            <div style={{ fontSize: fontSz-1, color:col.text, opacity:.55, marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              Salón {celda.salon}
                            </div>
                          </div>
                        ) : editMode && isDrag ? (
                          <div style={{ height:'100%', minHeight:40, borderRadius:'var(--radius)', border:`1.5px dashed ${valido?'#16a34a':'#d1d5db'}`, display:'flex', alignItems:'center', justifyContent:'center', opacity:.5 }}>
                            <span style={{ fontSize:16 }}>{valido ? '✓' : '+'}</span>
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              );

              // Insertar fila de receso ANTES del bloque 4 (índice 3)
              if (i === 3) {
                return [
                  <tr key="receso">
                    <td colSpan={dias.length + 1} style={{
                      padding:'5px 12px', background:'#f1f5f9', textAlign:'center',
                      fontSize:11, fontWeight:700, color:'var(--text-muted)',
                      letterSpacing:'.07em', borderTop:'1px solid var(--border)',
                      borderBottom:'1px solid var(--border)',
                    }}>
                      {receso.label} &nbsp;·&nbsp; {receso.inicio} – {receso.fin}
                    </td>
                  </tr>,
                  bloqueRow,
                ];
              }
              return bloqueRow;
            })}
          </tbody>
        </table>
      </div>

      {/* Leyenda */}
      {modo === 'grupo' && materiasUnicas.length > 0 && (
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', padding:'8px 4px 2px' }}>
          {materiasUnicas.map(mat => {
            const c = colorMateria(mat);
            return (
              <div key={mat} style={{ display:'flex', alignItems:'center', gap:5 }}>
                <div style={{ width:10, height:10, borderRadius:3, background:c.bg, border:`1.5px solid ${c.border}`, flexShrink:0 }} />
                <span style={{ fontSize:11, color:'var(--text-secondary)' }}>{mat}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
