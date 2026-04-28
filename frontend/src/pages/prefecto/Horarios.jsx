// src/pages/prefecto/Horarios.jsx
//
// Buscador unificado: alumno | docente
// Al seleccionar → muestra su horario semanal

import { useState, useEffect, useRef } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card       from '../../components/ui/Card';

// ── Mock de búsqueda ─────────────────────────────────────────────
const PERSONAS_MOCK = [
  { id:1,  tipo:'alumno',  nombre:'Juan Pérez García',      grupo:'1° A', matricula:'177001' },
  { id:2,  tipo:'alumno',  nombre:'María López Ruiz',        grupo:'2° B', matricula:'177002' },
  { id:3,  tipo:'alumno',  nombre:'Carlos Martínez Díaz',    grupo:'3° A', matricula:'177003' },
  { id:4,  tipo:'alumno',  nombre:'Ana Hernández Santos',    grupo:'1° B', matricula:'177004' },
  { id:5,  tipo:'alumno',  nombre:'Roberto Sánchez Torres',  grupo:'2° A', matricula:'177005' },
  { id:6,  tipo:'alumno',  nombre:'Laura Ramírez Cruz',      grupo:'3° B', matricula:'177006' },
  { id:7,  tipo:'alumno',  nombre:'Jorge Flores Morales',    grupo:'1° C', matricula:'177007' },
  { id:8,  tipo:'alumno',  nombre:'Sofía Díaz Morales',      grupo:'2° C', matricula:'177008' },
  { id:10, tipo:'docente', nombre:'Prof. Juan Hernández',    materia:'Matemáticas' },
  { id:11, tipo:'docente', nombre:'Profa. Ana García Soto',  materia:'Español' },
  { id:12, tipo:'docente', nombre:'Prof. Roberto Díaz',      materia:'Ciencias' },
  { id:13, tipo:'docente', nombre:'Profa. Patricia Reyes',   materia:'Historia' },
];

// Horario por persona (simplificado, celdas { materia, grupo, salon })
function generarHorario(persona) {
  if (persona.tipo === 'alumno') {
    return {
      Lunes:     { 1:{ mat:'Español',       salon:'A-01' }, 2:{ mat:'Matemáticas', salon:'B-02' }, 4:{ mat:'Ciencias', salon:'C-03' }, 6:{ mat:'Historia', salon:'A-02' } },
      Martes:    { 1:{ mat:'Ed. Física',    salon:'Patio'}, 3:{ mat:'Inglés',      salon:'B-03' }, 5:{ mat:'Artes',    salon:'A-04' } },
      Miércoles: { 2:{ mat:'Matemáticas',   salon:'B-02' }, 4:{ mat:'Geografía',   salon:'C-01' }, 6:{ mat:'F. Cívica',salon:'A-02' } },
      Jueves:    { 1:{ mat:'Español',       salon:'A-01' }, 3:{ mat:'Tecnología',  salon:'Lab-1'}, 5:{ mat:'Ciencias', salon:'C-03' } },
      Viernes:   { 2:{ mat:'Inglés',        salon:'B-03' }, 4:{ mat:'Matemáticas', salon:'B-02' }, 6:{ mat:'Historia', salon:'A-02' } },
    };
  }
  // Docente
  return {
    Lunes:     { 1:{ mat:'Matemáticas', grupo:'1° A', salon:'A-01' }, 3:{ mat:'Álgebra',   grupo:'2° B', salon:'B-03' }, 5:{ mat:'Geometría', grupo:'3° A', salon:'A-05' } },
    Martes:    { 2:{ mat:'Álgebra',     grupo:'2° B', salon:'B-03' }, 4:{ mat:'Geometría', grupo:'3° C', salon:'C-02' }, 6:{ mat:'Matemáticas',grupo:'1° A',salon:'A-01' } },
    Miércoles: { 1:{ mat:'Geometría',   grupo:'3° A', salon:'A-05' }, 3:{ mat:'Matemáticas',grupo:'1° A',salon:'A-01'}, 7:{ mat:'Álgebra',   grupo:'2° B', salon:'B-03' } },
    Jueves:    { 2:{ mat:'Geometría',   grupo:'3° C', salon:'C-02' }, 4:{ mat:'Geometría', grupo:'3° A', salon:'A-05' }, 6:{ mat:'Álgebra',   grupo:'2° B', salon:'B-03' } },
    Viernes:   { 1:{ mat:'Matemáticas', grupo:'1° A', salon:'A-01' }, 3:{ mat:'Geometría', grupo:'3° C', salon:'C-02' }, 5:{ mat:'Geometría', grupo:'3° A', salon:'A-05' } },
  };
}

const HORAS = [
  { id:1, label:'07:00 - 07:50' },
  { id:2, label:'07:50 - 08:40' },
  { id:3, label:'08:40 - 09:30' },
  { id:'R', label:'RECESO', receso:true },
  { id:4, label:'09:50 - 10:40' },
  { id:5, label:'10:40 - 11:30' },
  { id:6, label:'11:30 - 12:20' },
  { id:7, label:'12:20 - 13:10' },
];
const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes'];

const COLORES = [
  { bg:'#dbeafe', border:'#93c5fd', text:'#1e40af' },
  { bg:'#dcfce7', border:'#86efac', text:'#14532d' },
  { bg:'#f3e8ff', border:'#d8b4fe', text:'#6b21a8' },
  { bg:'#ffedd5', border:'#fdba74', text:'#c2410c' },
  { bg:'#ccfbf1', border:'#5eead4', text:'#0f766e' },
  { bg:'#fef3c7', border:'#fcd34d', text:'#92400e' },
  { bg:'#fce7f3', border:'#f9a8d4', text:'#9d174d' },
];
function colorMat(mat) {
  let h = 0;
  for (let c of mat) h = (h * 31 + c.charCodeAt(0)) % COLORES.length;
  return COLORES[h];
}

export default function PrefectoHorarios() {
  const [query,    setQuery]    = useState('');
  const [resultados,setResultados]=useState([]);
  const [persona,  setPersona]  = useState(null);
  const [tipo,     setTipo]     = useState('todos'); // 'todos'|'alumno'|'docente'
  const [showDrop, setShowDrop] = useState(false);
  const ref = useRef();

  // Cierra dropdown al hacer click fuera
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // Filtrar con debounce
  useEffect(() => {
    if (query.length < 2) { setResultados([]); return; }
    const t = setTimeout(() => {
      const filtrado = PERSONAS_MOCK.filter(p => {
        const matchQ = p.nombre.toLowerCase().includes(query.toLowerCase())
          || (p.matricula || '').includes(query);
        const matchT = tipo === 'todos' || p.tipo === tipo;
        return matchQ && matchT;
      });
      setResultados(filtrado);
      setShowDrop(true);
    }, 250);
    return () => clearTimeout(t);
  }, [query, tipo]);

  const seleccionar = (p) => {
    setPersona(p);
    setQuery(p.nombre);
    setShowDrop(false);
    setResultados([]);
  };
  const limpiar = () => { setPersona(null); setQuery(''); setResultados([]); };

  const horario = persona ? generarHorario(persona) : null;

  const thS = { padding:'12px 14px', textAlign:'left', fontSize:13, fontWeight:600, color:'var(--text-secondary)', borderBottom:'1.5px solid var(--border)' };

  return (
    <div style={{ padding:'0 2rem 2rem' }}>
      <PageHeader title="Horarios" subtitle="Consulta el horario de alumnos y docentes" />

      {/* Buscador */}
      <Card style={{ padding:'1.25rem', marginBottom:'1.5rem' }}>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>

          {/* Tabs tipo */}
          <div style={{ display:'flex', gap:6, flexShrink:0 }}>
            {[['todos','Todos'],['alumno','Alumnos'],['docente','Docentes']].map(([val,lab])=>(
              <button key={val} onClick={()=>setTipo(val)}
                style={{
                  padding:'7px 14px', borderRadius:'var(--radius)', fontSize:13, fontWeight:500,
                  border:'1.5px solid', cursor:'pointer', fontFamily:'inherit',
                  borderColor: tipo===val ? 'var(--green-700)' : 'var(--border)',
                  background:  tipo===val ? 'var(--green-700)' : '#fff',
                  color:       tipo===val ? '#fff' : 'var(--text-secondary)',
                }}>
                {lab}
              </button>
            ))}
          </div>

          {/* Input búsqueda */}
          <div ref={ref} style={{ position:'relative', flex:1, minWidth:280 }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontSize:15 }}>🔍</span>
            <input
              value={query}
              onChange={e=>{ setQuery(e.target.value); setPersona(null); }}
              onFocus={()=>{ if(resultados.length) setShowDrop(true); }}
              placeholder={tipo==='docente' ? 'Buscar docente por nombre…' : tipo==='alumno' ? 'Buscar alumno por nombre o matrícula…' : 'Buscar alumno o docente…'}
              style={{
                width:'100%', padding:'10px 36px', border:'1.5px solid var(--border)',
                borderRadius:'var(--radius)', fontSize:14, outline:'none',
              }}
              onFocus2={e=>e.target.style.borderColor='var(--green-600)'}
            />
            {query && (
              <button onClick={limpiar} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:16 }}>✕</button>
            )}

            {/* Dropdown resultados */}
            {showDrop && resultados.length > 0 && (
              <div style={{
                position:'absolute', top:'calc(100% + 4px)', left:0, right:0,
                background:'#fff', border:'1.5px solid var(--border)', borderRadius:'var(--radius)',
                boxShadow:'var(--shadow-lg)', zIndex:100, overflow:'hidden',
              }}>
                {resultados.map(p=>(
                  <div key={`${p.tipo}-${p.id}`} onClick={()=>seleccionar(p)}
                    style={{ padding:'10px 14px', cursor:'pointer', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--green-50)'}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <span style={{ fontSize:16 }}>{p.tipo==='alumno' ? '👤' : '🧑‍🏫'}</span>
                    <div>
                      <div style={{ fontSize:14, fontWeight:500 }}>{p.nombre}</div>
                      <div style={{ fontSize:12, color:'var(--text-secondary)' }}>
                        {p.tipo==='alumno' ? `${p.matricula} · Grupo ${p.grupo}` : p.materia}
                      </div>
                    </div>
                    <span style={{
                      marginLeft:'auto', fontSize:11, fontWeight:600, padding:'2px 8px',
                      borderRadius:20,
                      background: p.tipo==='alumno' ? '#dcfce7' : '#dbeafe',
                      color:      p.tipo==='alumno' ? '#14532d' : '#1e40af',
                    }}>
                      {p.tipo==='alumno' ? 'Alumno' : 'Docente'}
                    </span>
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
        </div>

        {/* Chip del seleccionado */}
        {persona && (
          <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:14, color:'var(--text-secondary)' }}>Mostrando horario de:</span>
            <span style={{
              display:'inline-flex', alignItems:'center', gap:6,
              background: persona.tipo==='alumno' ? 'var(--green-100)' : 'var(--blue-100)',
              color:       persona.tipo==='alumno' ? 'var(--green-800)' : 'var(--blue-600)',
              fontSize:13, fontWeight:600, padding:'4px 12px', borderRadius:20,
            }}>
              {persona.tipo==='alumno' ? '👤' : '🧑‍🏫'} {persona.nombre}
              {persona.tipo==='alumno' && ` · ${persona.grupo}`}
            </span>
          </div>
        )}
      </Card>

      {/* Horario */}
      {!persona && (
        <Card style={{ padding:'3rem', textAlign:'center' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>📅</div>
          <h3 style={{ fontSize:16, fontWeight:600, color:'var(--text-primary)', marginBottom:8 }}>
            Busca un alumno o docente
          </h3>
          <p style={{ fontSize:14, color:'var(--text-secondary)' }}>
            Ingresa al menos 2 caracteres para ver resultados.
          </p>
        </Card>
      )}

      {persona && horario && (
        <Card style={{ padding:0, overflowX:'auto' }}>
          {/* Encabezado de identidad */}
          <div style={{
            background:'linear-gradient(135deg, var(--green-800) 0%, var(--green-600) 100%)',
            borderRadius:'var(--radius-lg) var(--radius-lg) 0 0',
            padding:'1.25rem 1.5rem', color:'#fff',
          }}>
            <div style={{ fontSize:18, fontWeight:700 }}>
              {persona.tipo==='alumno' ? '👤' : '🧑‍🏫'} {persona.nombre}
            </div>
            <div style={{ fontSize:13, opacity:0.8, marginTop:3 }}>
              {persona.tipo==='alumno'
                ? `Matrícula: ${persona.matricula} · Grupo: ${persona.grupo}`
                : `Docente · ${persona.materia}`}
            </div>
          </div>

          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:680 }}>
            <thead>
              <tr style={{ background:'var(--green-50)' }}>
                <th style={{ ...thS, width:130 }}>Hora</th>
                {DIAS.map(d=>(
                  <th key={d} style={{ ...thS, textAlign:'center', borderLeft:'1px solid var(--border)', color:'var(--green-800)', fontWeight:700 }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HORAS.map(hora=>{
                if (hora.receso) return (
                  <tr key="rec">
                    <td colSpan={6} style={{
                      padding:'7px 14px', background:'#f3f4f6', textAlign:'center',
                      fontSize:12, fontWeight:600, color:'var(--text-muted)',
                      letterSpacing:'0.06em', borderTop:'1px solid var(--border)',
                      borderBottom:'1px solid var(--border)',
                    }}>RECESO · 09:30 - 09:50</td>
                  </tr>
                );
                return (
                  <tr key={hora.id}>
                    <td style={{ padding:'8px 14px', fontSize:12, color:'var(--text-secondary)', fontWeight:500, borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>
                      {hora.label}
                    </td>
                    {DIAS.map(dia=>{
                      const c = horario[dia]?.[hora.id];
                      const col = c ? colorMat(c.mat) : null;
                      return (
                        <td key={dia} style={{ padding:6, borderBottom:'1px solid var(--border)', borderLeft:'1px solid var(--border)', verticalAlign:'top', height:68 }}>
                          {c && (
                            <div style={{
                              background:col.bg, border:`1.5px solid ${col.border}`,
                              borderRadius:'var(--radius)', padding:'7px 10px', height:'100%',
                            }}>
                              <div style={{ fontSize:12, fontWeight:700, color:col.text }}>{c.mat}</div>
                              {c.grupo && <div style={{ fontSize:11, color:col.text, opacity:0.8, marginTop:1 }}>{c.grupo}</div>}
                              <div style={{ fontSize:11, color:col.text, opacity:0.65, marginTop:2 }}>Salón {c.salon}</div>
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
