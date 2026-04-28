// src/pages/prefecto/Reportes.jsx
//
// Buscador de alumno → muestra su historial de reportes.
// También puede llegar con ?alumno=ID&nombre=NOM desde la tabla de Alumnos.

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader        from '../../components/layout/PageHeader';
import Card              from '../../components/ui/Card';
import Button            from '../../components/ui/Button';
import ModalCrearReporte from '../../components/reportes/ModalCrearReporte';

// ── Mock ─────────────────────────────────────────────────────────
const ALUMNOS_MOCK = [
  { id:1, nombre:'Juan Pérez García',     grupo:'1° A', matricula:'177001', puntosConducta:85 },
  { id:2, nombre:'María López Ruiz',      grupo:'2° B', matricula:'177002', puntosConducta:45 },
  { id:3, nombre:'Carlos Martínez Díaz',  grupo:'3° A', matricula:'177003', puntosConducta:92 },
  { id:4, nombre:'Ana Hernández Santos',  grupo:'1° B', matricula:'177004', puntosConducta:68 },
  { id:5, nombre:'Roberto Sánchez Torres',grupo:'2° A', matricula:'177005', puntosConducta:78 },
  { id:6, nombre:'Laura Ramírez Cruz',    grupo:'3° B', matricula:'177006', puntosConducta:55 },
  { id:7, nombre:'Jorge Flores Morales',  grupo:'1° C', matricula:'177007', puntosConducta:88 },
  { id:8, nombre:'Sofía Díaz Morales',    grupo:'2° C', matricula:'177008', puntosConducta:72 },
  { id:9, nombre:'Miguel Díaz Rodríguez', grupo:'3° C', matricula:'177009', puntosConducta:38 },
];

function generarReportes(alumno) {
  const pool = [
    { tipo:'Negativo', gravedad:'MEDIO',        delta:-5,  desc:'Llegó tarde a clase de matemáticas sin justificación. Se habló con el alumno sobre la importancia de la puntualidad.',      fecha:'26 de abril, 2026', hora:'2:15 PM', por:'Luis Ramírez Santos (Prefecto)' },
    { tipo:'Negativo', gravedad:'NO_GRAVE',      delta:-2,  desc:'No portaba uniforme completo. Se notificó al tutor por mensaje.',                                                           fecha:'24 de abril, 2026', hora:'11:30 AM',por:'Patricia Morales (Prefecto)' },
    { tipo:'Positivo', gravedad:'MUY_POSITIVO',  delta:+6,  desc:'Participó activamente en el evento cívico y apoyó al equipo de organización. Ejemplo para sus compañeros.',               fecha:'22 de abril, 2026', hora:'10:00 AM',por:'Luis Ramírez Santos (Prefecto)' },
    { tipo:'Negativo', gravedad:'GRAVE',         delta:-10, desc:'Falta de respeto grave hacia un compañero. Se citó a padre de familia y se levantó acta.',                               fecha:'18 de abril, 2026', hora:'9:00 AM', por:'Luis Ramírez Santos (Prefecto)' },
    { tipo:'Negativo', gravedad:'MEDIO',         delta:-5,  desc:'Ausencia injustificada al tercer bloque. No se presentó justificante al día siguiente.',                                  fecha:'15 de abril, 2026', hora:'8:30 AM', por:'Patricia Morales (Prefecto)' },
    { tipo:'Positivo', gravedad:'MEDIANAMENTE',  delta:+4,  desc:'Colaboró en limpieza del patio durante el receso sin que se le pidiera.',                                                 fecha:'10 de abril, 2026', hora:'11:00 AM',por:'Luis Ramírez Santos (Prefecto)' },
    { tipo:'Negativo', gravedad:'NO_GRAVE',      delta:-2,  desc:'Uso de celular en clase. Se confiscó el dispositivo y fue entregado al término del día.',                                 fecha:'5 de abril, 2026',  hora:'2:00 PM', por:'Patricia Morales (Prefecto)' },
    { tipo:'Positivo', gravedad:'LEVE',          delta:+2,  desc:'Entregó objetos olvidados por compañero a la dirección en lugar de quedárselos.',                                        fecha:'1 de abril, 2026',  hora:'1:30 PM', por:'Luis Ramírez Santos (Prefecto)' },
  ];
  // Calcular puntos progresivos desde el actual hacia atrás
  let pts = alumno.puntosConducta;
  return pool.slice(0, 5 + (alumno.id % 4)).map(r => {
    const despues = pts;
    const antes   = pts - r.delta;
    pts = antes;
    return { ...r, puntosAntes: antes, puntosDespues: despues };
  });
}

const GRAVEDAD_LABEL = {
  GRAVE:'Grave (-10 pts)', MEDIO:'Medio (-5 pts)', NO_GRAVE:'No grave (-2 pts)',
  MUY_POSITIVO:'Muy positivo (+6 pts)', MEDIANAMENTE:'Medianamente (+4 pts)', LEVE:'Leve (+2 pts)',
};

function ptsBadgePts(pts) {
  if (pts <= 45) return { bg:'#fee2e2', color:'#991b1b' };
  if (pts <= 65) return { bg:'#ffedd5', color:'#c2410c' };
  if (pts <= 79) return { bg:'#fef3c7', color:'#92400e' };
  return { bg:'#dcfce7', color:'#166534' };
}

export default function PrefectoReportes() {
  const [searchParams] = useSearchParams();
  const [query,    setQuery]    = useState('');
  const [resultados,setResultados]=useState([]);
  const [alumno,   setAlumno]   = useState(null);
  const [reportes, setReportes] = useState([]);
  const [filtro,   setFiltro]   = useState('Todos');
  const [showDrop, setShowDrop] = useState(false);
  const [modal,    setModal]    = useState(false);
  const ref = useRef();

  // Llega desde Alumnos con query params
  useEffect(() => {
    const id  = Number(searchParams.get('alumno'));
    const nom = searchParams.get('nombre');
    if (id && nom) {
      const a = ALUMNOS_MOCK.find(x => x.id === id);
      if (a) seleccionar(a);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cerrar dropdown fuera
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // Búsqueda con debounce
  useEffect(() => {
    if (query.length < 2) { setResultados([]); return; }
    const t = setTimeout(() => {
      setResultados(ALUMNOS_MOCK.filter(a =>
        a.nombre.toLowerCase().includes(query.toLowerCase()) || a.matricula.includes(query)
      ));
      setShowDrop(true);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const seleccionar = (a) => {
    setAlumno(a);
    setQuery(a.nombre);
    setShowDrop(false);
    setResultados([]);
    setFiltro('Todos');
    setReportes(generarReportes(a));
  };
  const limpiar = () => { setAlumno(null); setQuery(''); setReportes([]); };

  const reportesFiltrados = filtro === 'Todos'
    ? reportes
    : reportes.filter(r => r.tipo === filtro);

  const countPos = reportes.filter(r=>r.tipo==='Positivo').length;
  const countNeg = reportes.filter(r=>r.tipo==='Negativo').length;

  return (
    <div style={{ padding:'0 2rem 2rem' }}>
      <PageHeader title="Reportes" subtitle="Historial de conducta por alumno" />

      {/* Buscador */}
      <Card style={{ padding:'1.25rem', marginBottom:'1.5rem' }}>
        <div ref={ref} style={{ position:'relative' }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontSize:15 }}>🔍</span>
          <input
            value={query}
            onChange={e=>{ setQuery(e.target.value); setAlumno(null); }}
            placeholder="Buscar alumno por nombre o matrícula…"
            style={{
              width:'100%', padding:'11px 40px', border:'1.5px solid var(--border)',
              borderRadius:'var(--radius)', fontSize:14, outline:'none',
            }}
            onFocus={e=>{ e.target.style.borderColor='var(--green-600)'; if(resultados.length) setShowDrop(true); }}
            onBlur={e=>e.target.style.borderColor='var(--border)'}
          />
          {query && (
            <button onClick={limpiar} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:16 }}>✕</button>
          )}

          {showDrop && resultados.length > 0 && (
            <div style={{
              position:'absolute', top:'calc(100% + 4px)', left:0, right:0,
              background:'#fff', border:'1.5px solid var(--border)', borderRadius:'var(--radius)',
              boxShadow:'var(--shadow-lg)', zIndex:100, overflow:'hidden',
            }}>
              {resultados.map(a=>(
                <div key={a.id} onClick={()=>seleccionar(a)}
                  style={{ padding:'10px 14px', cursor:'pointer', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--green-50)'}
                  onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <span style={{ fontSize:16 }}>👤</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:500 }}>{a.nombre}</div>
                    <div style={{ fontSize:12, color:'var(--text-secondary)' }}>{a.matricula} · Grupo {a.grupo}</div>
                  </div>
                  {(() => { const { bg, color } = ptsBadgePts(a.puntosConducta); return (
                    <span style={{ background:bg, color, fontSize:12, fontWeight:700, padding:'2px 10px', borderRadius:20 }}>
                      {a.puntosConducta} pts
                    </span>
                  ); })()}
                </div>
              ))}
            </div>
          )}
          {showDrop && query.length >= 2 && resultados.length === 0 && (
            <div style={{
              position:'absolute', top:'calc(100% + 4px)', left:0, right:0,
              background:'#fff', border:'1.5px solid var(--border)', borderRadius:'var(--radius)',
              padding:'14px', fontSize:14, color:'var(--text-secondary)', zIndex:100,
            }}>Sin resultados para "{query}"</div>
          )}
        </div>
      </Card>

      {/* Estado vacío */}
      {!alumno && (
        <Card style={{ padding:'3rem', textAlign:'center' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>📋</div>
          <h3 style={{ fontSize:16, fontWeight:600, color:'var(--text-primary)', marginBottom:8 }}>Busca un alumno</h3>
          <p style={{ fontSize:14, color:'var(--text-secondary)' }}>Ingresa el nombre o matrícula para ver su historial de reportes.</p>
        </Card>
      )}

      {/* Historial */}
      {alumno && (
        <>
          {/* Header alumno */}
          <div style={{
            background:'linear-gradient(135deg, var(--green-800) 0%, var(--green-600) 100%)',
            borderRadius:'var(--radius-lg)', padding:'1.25rem 1.5rem', color:'#fff', marginBottom:'1.25rem',
            display:'flex', alignItems:'center', justifyContent:'space-between',
          }}>
            <div>
              <div style={{ fontSize:20, fontWeight:700 }}>Historial de Reportes</div>
              <div style={{ fontSize:14, opacity:0.85, marginTop:3 }}>{alumno.nombre}</div>
            </div>
            <Button onClick={()=>setModal(true)} style={{ background:'rgba(255,255,255,0.2)', color:'#fff', border:'1.5px solid rgba(255,255,255,0.4)' }}>
              + Nuevo Reporte
            </Button>
          </div>

          {/* Filtros */}
          <Card style={{ padding:'1rem 1.25rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <span style={{ fontSize:14, color:'var(--text-secondary)' }}>🔽 Filtrar por tipo:</span>
            {[
              { label:`Todos (${reportes.length})`,       val:'Todos',    bg:'var(--green-700)', active:filtro==='Todos' },
              { label:`Positivos (${countPos})`,          val:'Positivo', bg:'#16a34a',          active:filtro==='Positivo' },
              { label:`Negativos (${countNeg})`,          val:'Negativo', bg:'#ef4444',          active:filtro==='Negativo' },
            ].map(f=>(
              <button key={f.val} onClick={()=>setFiltro(f.val)} style={{
                padding:'6px 16px', borderRadius:20, fontSize:13, fontWeight:f.active?700:500,
                border:'1.5px solid transparent', cursor:'pointer', fontFamily:'inherit',
                background: f.active ? f.bg : '#f3f4f6',
                color:      f.active ? '#fff' : 'var(--text-secondary)',
              }}>{f.label}</button>
            ))}
          </Card>

          {/* Tarjetas de reporte */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {reportesFiltrados.map((r,i)=>{
              const isNeg = r.tipo === 'Negativo';
              const borderColor = isNeg ? '#ef4444' : '#22c55e';
              const bgCard      = isNeg ? '#fef2f2' : '#f0fdf4';
              const antesStyle  = ptsBadgePts(r.puntosAntes);
              const despStyle   = ptsBadgePts(r.puntosDespues);
              return (
                <Card key={i} style={{ padding:'1.25rem', borderLeft:`4px solid ${borderColor}`, background:bgCard, borderRadius:'0 var(--radius-lg) var(--radius-lg) 0' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                    {/* Izquierda */}
                    <div style={{ flex:1 }}>
                      {/* Badges tipo + gravedad */}
                      <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                        <span style={{ background: isNeg ? '#fee2e2':'#dcfce7', color: isNeg ? '#991b1b':'#166534', fontSize:13, fontWeight:700, padding:'3px 12px', borderRadius:20 }}>
                          {r.tipo}
                        </span>
                        <span style={{ background:'#f3f4f6', color:'var(--text-secondary)', fontSize:13, fontWeight:500, padding:'3px 12px', borderRadius:20 }}>
                          {GRAVEDAD_LABEL[r.gravedad]}
                        </span>
                      </div>

                      {/* Fecha */}
                      <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--text-secondary)', marginBottom:10 }}>
                        <span>📅</span>
                        <span>{r.fecha} - {r.hora}</span>
                      </div>

                      {/* Descripción */}
                      <p style={{ fontSize:14, color:'var(--text-primary)', lineHeight:1.6, marginBottom:10 }}>
                        {r.desc}
                      </p>

                      {/* Generado por */}
                      <div style={{ fontSize:13, color:'var(--text-secondary)' }}>
                        <strong>Generado por:</strong> {r.por}
                      </div>
                    </div>

                    {/* Derecha — cambio de puntos */}
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:6 }}>Puntos de conducta</div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:18, fontWeight:700, color:'var(--text-primary)' }}>{r.puntosAntes}</span>
                        <span style={{ color: isNeg ? '#ef4444':'#16a34a', fontSize:16 }}>{isNeg ? '↘' : '↗'}</span>
                        <span style={{ fontSize:18, fontWeight:700, color: isNeg ? '#ef4444':'#16a34a' }}>{r.puntosDespues}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

            {reportesFiltrados.length === 0 && (
              <Card style={{ padding:'2rem', textAlign:'center', color:'var(--text-secondary)' }}>
                No hay reportes de tipo "{filtro}" para este alumno.
              </Card>
            )}
          </div>

          <ModalCrearReporte
            open={modal}
            onClose={()=>setModal(false)}
            alumnoPreset={{ id:alumno.id, nombre:alumno.nombre, matricula:alumno.matricula, puntosConducta:alumno.puntosConducta }}
            onSuccess={()=>{ setReportes(generarReportes(alumno)); }}
          />
        </>
      )}
    </div>
  );
}
