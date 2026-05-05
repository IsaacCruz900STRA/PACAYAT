// src/pages/directivo/Reportes.jsx
import { useState, useEffect, useRef } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card       from '../../components/ui/Card';
import { ALUMNOS_MOCK, REPORTES_MOCK, GRAVEDAD_LABEL, ptsBadgeStyle } from './_mockData';

export default function DirectivoReportes() {
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState([]);
  const [alumno,   setAlumno]   = useState(null);
  const [filtro,   setFiltro]   = useState('Todos');
  const [showDrop, setShowDrop] = useState(false);
  const [vistaGlobal, setVistaGlobal] = useState(true);
  const [filtroGlobal, setFiltroGlobal] = useState('Todos');
  const ref = useRef();

  useEffect(() => {
    const fn = e => { if(ref.current && !ref.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const t = setTimeout(() => {
      setResults(ALUMNOS_MOCK.filter(a =>
        a.nombre.toLowerCase().includes(query.toLowerCase()) || a.matricula.includes(query)
      ));
      setShowDrop(true);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const seleccionar = (a) => {
    setAlumno(a); setQuery(a.nombre); setShowDrop(false);
    setResults([]); setFiltro('Todos'); setVistaGlobal(false);
  };
  const limpiar = () => { setAlumno(null); setQuery(''); setVistaGlobal(true); };

  const reportesAlumno = alumno ? REPORTES_MOCK.filter(r => r.alumno === alumno.nombre) : [];
  const filtrados      = filtro === 'Todos' ? reportesAlumno : reportesAlumno.filter(r => r.tipo === filtro);
  const reportesGlobales = filtroGlobal === 'Todos' ? REPORTES_MOCK : REPORTES_MOCK.filter(r => r.tipo === filtroGlobal);

  const thS = { textAlign:'left', padding:'10px 14px', fontSize:13, fontWeight:600, color:'var(--green-800)', background:'var(--green-50)', borderBottom:'1px solid var(--border)' };
  const tdS = { padding:'11px 14px', borderBottom:'1px solid var(--border)', fontSize:13, verticalAlign:'middle' };

  return (
    <div style={{ padding:'0 2rem 2rem' }}>
      <PageHeader title="Reportes" subtitle="Historial de conducta de la institución" />

      {/* Buscador */}
      <Card style={{ padding:'1.25rem', marginBottom:'1.5rem' }}>
        <div ref={ref} style={{ position:'relative' }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontSize:15 }}>🔍</span>
          <input value={query} onChange={e=>{ setQuery(e.target.value); setAlumno(null); setVistaGlobal(false); }}
            placeholder="Buscar alumno por nombre o matrícula para ver su historial..."
            style={{ width:'100%', padding:'11px 40px', border:'1.5px solid var(--border)', borderRadius:'var(--radius)', fontSize:14, outline:'none' }}
            onFocus={e=>{ e.target.style.borderColor='var(--green-600)'; if(results.length) setShowDrop(true); }}
            onBlur={e=>e.target.style.borderColor='var(--border)'}
          />
          {query && <button onClick={limpiar} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:16 }}>✕</button>}
          {showDrop && results.length > 0 && (
            <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:'#fff', border:'1.5px solid var(--border)', borderRadius:'var(--radius)', boxShadow:'var(--shadow-lg)', zIndex:100, overflow:'hidden' }}>
              {results.map(a => {
                const { bg, color } = ptsBadgeStyle(a.puntos);
                return (
                  <div key={a.id} onClick={() => seleccionar(a)}
                    style={{ padding:'10px 14px', cursor:'pointer', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--green-50)'}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <span style={{ fontSize:16 }}>👤</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:500 }}>{a.nombre}</div>
                      <div style={{ fontSize:12, color:'var(--text-secondary)' }}>{a.matricula} · Grupo {a.grupo}</div>
                    </div>
                    <span style={{ background:bg, color, fontSize:12, fontWeight:700, padding:'2px 10px', borderRadius:20 }}>{a.puntos} pts</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {alumno && (
          <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ background:'var(--green-100)', color:'var(--green-800)', fontSize:13, fontWeight:600, padding:'3px 12px', borderRadius:20 }}>
              👤 {alumno.nombre} · {alumno.grupo}
            </span>
            <button onClick={limpiar} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)', fontSize:13, fontFamily:'inherit' }}>← Ver todos los reportes</button>
          </div>
        )}
      </Card>

      {/* Vista global */}
      {vistaGlobal && (
        <>
          <Card style={{ padding:'1rem 1.25rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <span style={{ fontSize:14, color:'var(--text-secondary)' }}>🔽 Tipo:</span>
            {[
              { label:`Todos (${REPORTES_MOCK.length})`,                              val:'Todos',    bg:'var(--green-700)' },
              { label:`Positivos (${REPORTES_MOCK.filter(r=>r.tipo==='Positivo').length})`, val:'Positivo', bg:'#16a34a' },
              { label:`Negativos (${REPORTES_MOCK.filter(r=>r.tipo==='Negativo').length})`, val:'Negativo', bg:'#ef4444' },
            ].map(f=>(
              <button key={f.val} onClick={()=>setFiltroGlobal(f.val)} style={{
                padding:'6px 14px', borderRadius:20, fontSize:13, cursor:'pointer',
                fontWeight:filtroGlobal===f.val?700:500, border:'1.5px solid transparent', fontFamily:'inherit',
                background:filtroGlobal===f.val?f.bg:'#f3f4f6', color:filtroGlobal===f.val?'#fff':'var(--text-secondary)',
              }}>{f.label}</button>
            ))}
          </Card>
          <Card style={{ padding:0 }}>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>{['Fecha','Alumno','Grupo','Tipo','Gravedad','Descripción','Por'].map(h=><th key={h} style={thS}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {reportesGlobales.map(r=>{
                    const isNeg = r.tipo==='Negativo';
                    return (
                      <tr key={r.id} style={{ cursor:'pointer' }}
                        onClick={()=>seleccionar(ALUMNOS_MOCK.find(a=>a.nombre===r.alumno)||{id:r.id,nombre:r.alumno,grupo:r.grupo,matricula:'—',puntos:r.ptsDespues})}
                        onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
                        onMouseLeave={e=>e.currentTarget.style.background=''}>
                        <td style={{ ...tdS, fontSize:12, color:'var(--text-secondary)', whiteSpace:'nowrap' }}>{r.fecha}</td>
                        <td style={{ ...tdS, fontWeight:500 }}>{r.alumno}</td>
                        <td style={tdS}>{r.grupo}</td>
                        <td style={tdS}><span style={{ background:isNeg?'#fee2e2':'#dcfce7', color:isNeg?'#991b1b':'#166534', fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>{r.tipo}</span></td>
                        <td style={{ ...tdS, fontSize:12, color:'var(--text-secondary)' }}>{GRAVEDAD_LABEL[r.gravedad]}</td>
                        <td style={{ ...tdS, maxWidth:180 }}>{r.desc}</td>
                        <td style={{ ...tdS, fontSize:12, color:'var(--text-secondary)' }}>{r.por}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding:'10px 14px', fontSize:13, color:'var(--text-secondary)', borderTop:'1px solid var(--border)' }}>
              {reportesGlobales.length} reportes · Clic en fila para ver historial del alumno
            </div>
          </Card>
        </>
      )}

      {/* Historial de alumno */}
      {!vistaGlobal && alumno && (
        <>
          <div style={{ background:'linear-gradient(135deg,var(--green-800) 0%,var(--green-600) 100%)', borderRadius:'var(--radius-lg)', padding:'1.25rem 1.5rem', color:'#fff', marginBottom:'1.25rem' }}>
            <div style={{ fontSize:20, fontWeight:700 }}>Historial de Reportes</div>
            <div style={{ fontSize:14, opacity:.85, marginTop:2 }}>{alumno.nombre} · {alumno.grupo}</div>
          </div>
          <Card style={{ padding:'1rem 1.25rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <span style={{ fontSize:14, color:'var(--text-secondary)' }}>🔽 Tipo:</span>
            {[
              { label:`Todos (${reportesAlumno.length})`, val:'Todos', bg:'var(--green-700)' },
              { label:`Positivos (${reportesAlumno.filter(r=>r.tipo==='Positivo').length})`, val:'Positivo', bg:'#16a34a' },
              { label:`Negativos (${reportesAlumno.filter(r=>r.tipo==='Negativo').length})`, val:'Negativo', bg:'#ef4444' },
            ].map(f=>(
              <button key={f.val} onClick={()=>setFiltro(f.val)} style={{
                padding:'6px 14px', borderRadius:20, fontSize:13, cursor:'pointer',
                fontWeight:filtro===f.val?700:500, border:'1.5px solid transparent', fontFamily:'inherit',
                background:filtro===f.val?f.bg:'#f3f4f6', color:filtro===f.val?'#fff':'var(--text-secondary)',
              }}>{f.label}</button>
            ))}
          </Card>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {filtrados.length===0
              ? <Card style={{ padding:'2rem', textAlign:'center', color:'var(--text-secondary)' }}>No hay reportes de tipo "{filtro}".</Card>
              : filtrados.map((r,i)=>{
                const isNeg = r.tipo==='Negativo';
                return (
                  <Card key={i} style={{ padding:'1.25rem', borderLeft:`4px solid ${isNeg?'#ef4444':'#22c55e'}`, background:isNeg?'#fef2f2':'#f0fdf4', borderRadius:'0 var(--radius-lg) var(--radius-lg) 0' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                          <span style={{ background:isNeg?'#fee2e2':'#dcfce7', color:isNeg?'#991b1b':'#166534', fontSize:13, fontWeight:700, padding:'3px 12px', borderRadius:20 }}>{r.tipo}</span>
                          <span style={{ background:'#f3f4f6', color:'var(--text-secondary)', fontSize:13, fontWeight:500, padding:'3px 12px', borderRadius:20 }}>{GRAVEDAD_LABEL[r.gravedad]}</span>
                        </div>
                        <div style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:8 }}>📅 {r.fecha}</div>
                        <p style={{ fontSize:14, color:'var(--text-primary)', lineHeight:1.6, marginBottom:8 }}>{r.desc}</p>
                        <div style={{ fontSize:13, color:'var(--text-secondary)' }}><strong>Generado por:</strong> {r.por}</div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:6 }}>Puntos de conducta</div>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontSize:18, fontWeight:700 }}>{r.ptsAntes}</span>
                          <span style={{ fontSize:16, color:isNeg?'#ef4444':'#16a34a' }}>{isNeg?'↘':'↗'}</span>
                          <span style={{ fontSize:18, fontWeight:700, color:isNeg?'#ef4444':'#16a34a' }}>{r.ptsDespues}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            }
          </div>
        </>
      )}
    </div>
  );
}
