// src/pages/directivo/Horarios.jsx
import { useState, useEffect, useRef } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card       from '../../components/ui/Card';
import {
  ALUMNOS_MOCK, PERSONAL_MOCK, HORARIOS_MOCK, HORARIO_ALUMNO,
  HORAS_HORARIO, DIAS, colorMat, ROL_LABEL,
} from './_mockData';

// Unificar personas buscables
const PERSONAS = [
  ...ALUMNOS_MOCK.map(a => ({ id:`a-${a.id}`, tipo:'alumno',   nombre:a.nombre, sub:`${a.matricula} · Grupo ${a.grupo}`, key:a.nombre })),
  ...PERSONAL_MOCK.map(p => ({ id:`p-${p.id}`, tipo:p.rol,     nombre:p.nombre, sub:ROL_LABEL[p.rol] || p.rol,            key:p.nombre })),
];

const TIPO_COLORS = {
  alumno:         { bg:'#dcfce7', color:'#14532d', label:'Alumno'         },
  DOCENTE:        { bg:'#dbeafe', color:'#1e40af', label:'Docente'        },
  PREFECTO:       { bg:'#ffedd5', color:'#c2410c', label:'Prefecto'       },
  SECRETARIA:     { bg:'#f3e8ff', color:'#7e22ce', label:'Secretaria'     },
  CONTROL_ESCOLAR:{ bg:'#ccfbf1', color:'#0f766e', label:'Control Escolar'},
};

const thS = { padding:'12px 14px', textAlign:'center', fontSize:13, fontWeight:700, color:'var(--green-800)', background:'var(--green-50)', borderBottom:'1.5px solid var(--border)', borderLeft:'1px solid var(--border)' };

export default function DirectivoHorarios() {
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState([]);
  const [persona,  setPersona]  = useState(null);
  const [showDrop, setShowDrop] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const fn = e => { if(ref.current && !ref.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const t = setTimeout(() => {
      setResults(PERSONAS.filter(p => p.nombre.toLowerCase().includes(query.toLowerCase())).slice(0,8));
      setShowDrop(true);
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  const seleccionar = (p) => { setPersona(p); setQuery(p.nombre); setShowDrop(false); setResults([]); };
  const limpiar     = ()  => { setPersona(null); setQuery(''); };

  // Obtener horario según tipo
  const horario = persona
    ? (HORARIOS_MOCK[persona.nombre] || HORARIO_ALUMNO)
    : null;

  const tc = persona ? (TIPO_COLORS[persona.tipo] || TIPO_COLORS.alumno) : null;

  return (
    <div style={{ padding:'0 2rem 2rem' }}>
      <PageHeader title="Horarios" subtitle="Consulta el horario de cualquier alumno o personal" />

      {/* Buscador */}
      <Card style={{ padding:'1.25rem', marginBottom:'1.5rem' }}>
        <div ref={ref} style={{ position:'relative' }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontSize:15 }}>🔍</span>
          <input value={query} onChange={e=>{ setQuery(e.target.value); setPersona(null); }}
            placeholder="Buscar alumno, docente, prefecto, secretaria..."
            style={{ width:'100%', padding:'11px 40px', border:'1.5px solid var(--border)', borderRadius:'var(--radius)', fontSize:14, outline:'none' }}
            onFocus={e=>{ e.target.style.borderColor='var(--green-600)'; if(results.length) setShowDrop(true); }}
            onBlur={e=>e.target.style.borderColor='var(--border)'}
          />
          {query && (
            <button onClick={limpiar} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:16 }}>✕</button>
          )}

          {showDrop && results.length > 0 && (
            <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:'#fff', border:'1.5px solid var(--border)', borderRadius:'var(--radius)', boxShadow:'var(--shadow-lg)', zIndex:100, overflow:'hidden' }}>
              {results.map(p => {
                const c = TIPO_COLORS[p.tipo] || TIPO_COLORS.alumno;
                return (
                  <div key={p.id} onClick={() => seleccionar(p)}
                    style={{ padding:'10px 14px', cursor:'pointer', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--green-50)'}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <span style={{ fontSize:16 }}>{p.tipo==='alumno' ? '👤' : p.tipo==='DOCENTE' ? '🧑‍🏫' : p.tipo==='PREFECTO' ? '🛡' : '🏫'}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:500 }}>{p.nombre}</div>
                      <div style={{ fontSize:12, color:'var(--text-secondary)' }}>{p.sub}</div>
                    </div>
                    <span style={{ background:c.bg, color:c.color, fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20 }}>{c.label}</span>
                  </div>
                );
              })}
            </div>
          )}
          {showDrop && query.length >= 2 && results.length === 0 && (
            <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:'#fff', border:'1.5px solid var(--border)', borderRadius:'var(--radius)', padding:'14px', fontSize:14, color:'var(--text-secondary)', zIndex:100 }}>
              Sin resultados para "{query}"
            </div>
          )}
        </div>
        {persona && (
          <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:13, color:'var(--text-secondary)' }}>Mostrando horario de:</span>
            <span style={{ background:tc.bg, color:tc.color, fontSize:13, fontWeight:600, padding:'3px 12px', borderRadius:20 }}>
              {persona.nombre} · {tc.label}
            </span>
          </div>
        )}
      </Card>

      {/* Estado vacío */}
      {!persona && (
        <Card style={{ padding:'3rem', textAlign:'center', color:'var(--text-secondary)' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>📅</div>
          <h3 style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>Busca un alumno o miembro del personal</h3>
          <p style={{ fontSize:14 }}>Ingresa al menos 2 caracteres para ver resultados.</p>
        </Card>
      )}

      {/* Horario */}
      {persona && horario && (
        <Card style={{ padding:0, overflowX:'auto' }}>
          <div style={{ background:'linear-gradient(135deg,var(--green-800) 0%,var(--green-600) 100%)', borderRadius:'var(--radius-lg) var(--radius-lg) 0 0', padding:'1rem 1.5rem', color:'#fff' }}>
            <div style={{ fontSize:17, fontWeight:700 }}>{persona.nombre}</div>
            <div style={{ fontSize:13, opacity:.85, marginTop:2 }}>{tc.label} · {persona.sub}</div>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:640 }}>
            <thead>
              <tr style={{ background:'var(--green-50)' }}>
                <th style={{ ...thS, textAlign:'left', borderLeft:'none', width:130 }}>Hora</th>
                {DIAS.map(d=><th key={d} style={thS}>{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {HORAS_HORARIO.map(hora => {
                if (hora.receso) return (
                  <tr key="rec">
                    <td colSpan={6} style={{ padding:'7px 14px', background:'#f3f4f6', textAlign:'center', fontSize:12, fontWeight:600, color:'var(--text-muted)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', letterSpacing:'0.06em' }}>
                      RECESO · 09:30 - 09:50
                    </td>
                  </tr>
                );
                return (
                  <tr key={hora.id}>
                    <td style={{ padding:'8px 14px', fontSize:12, color:'var(--text-secondary)', fontWeight:500, borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>{hora.label}</td>
                    {DIAS.map(dia => {
                      const c   = horario[dia]?.[hora.id];
                      const col = c ? colorMat(c.mat) : null;
                      return (
                        <td key={dia} style={{ padding:6, borderBottom:'1px solid var(--border)', borderLeft:'1px solid var(--border)', verticalAlign:'top', height:66 }}>
                          {c && (
                            <div style={{ background:col.bg, border:`1.5px solid ${col.border}`, borderRadius:'var(--radius)', padding:'7px 10px', height:'100%' }}>
                              <div style={{ fontSize:12, fontWeight:700, color:col.text }}>{c.mat}</div>
                              {c.grupo && <div style={{ fontSize:11, color:col.text, opacity:.8, marginTop:1 }}>{c.grupo}</div>}
                              <div style={{ fontSize:10, color:col.text, opacity:.65, marginTop:1 }}>Salón {c.salon}</div>
                            </div>
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
      )}
    </div>
  );
}
