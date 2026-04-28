// src/pages/prefecto/Alumnos.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader        from '../../components/layout/PageHeader';
import Card              from '../../components/ui/Card';
import Button            from '../../components/ui/Button';
import Badge             from '../../components/ui/Badge';
import ModalCrearReporte from '../../components/reportes/ModalCrearReporte';
import { useFetch }      from '../../hooks/useFetch';
import { getAlumnos }    from '../../api/alumnos.api';

const GRUPOS = ['Todos los grupos','1° A','1° B','1° C','2° A','2° B','2° C','3° A','3° B','3° C'];

function PtsBadge({ pts }) {
  const color = pts <= 45 ? { bg:'#fee2e2', fg:'#991b1b' }
              : pts <= 65 ? { bg:'#ffedd5', fg:'#c2410c' }
              : pts <= 79 ? { bg:'#fef3c7', fg:'#92400e' }
              : { bg:'#dcfce7', fg:'#166534' };
  return (
    <span style={{ background:color.bg, color:color.fg, fontSize:13, fontWeight:700, padding:'4px 12px', borderRadius:20 }}>
      {pts} pts
    </span>
  );
}

const ALUMNOS_MOCK = [
  { id:1, matricula:'177001', nombreCompleto:'Juan Pérez García',      grupo:'1° A', puntosConducta:85, tutor:'María García',      estado:'Activo' },
  { id:2, matricula:'177002', nombreCompleto:'María López Ruiz',       grupo:'2° B', puntosConducta:45, tutor:'Carlos López',      estado:'Activo' },
  { id:3, matricula:'177003', nombreCompleto:'Carlos Martínez Díaz',   grupo:'3° A', puntosConducta:92, tutor:'Ana Martínez',      estado:'Activo' },
  { id:4, matricula:'177004', nombreCompleto:'Ana Hernández Santos',   grupo:'1° B', puntosConducta:68, tutor:'Roberto Hernández', estado:'Activo' },
  { id:5, matricula:'177005', nombreCompleto:'Roberto Sánchez Torres', grupo:'2° A', puntosConducta:78, tutor:'Laura Sánchez',     estado:'Activo' },
  { id:6, matricula:'177006', nombreCompleto:'Laura Ramírez Cruz',     grupo:'3° B', puntosConducta:55, tutor:'Jorge Ramírez',     estado:'Activo' },
  { id:7, matricula:'177007', nombreCompleto:'Jorge Flores Morales',   grupo:'1° C', puntosConducta:88, tutor:'Patricia Flores',   estado:'Activo' },
  { id:8, matricula:'177008', nombreCompleto:'Sofía Díaz Morales',     grupo:'2° C', puntosConducta:72, tutor:'Manuel Díaz',       estado:'Activo' },
  { id:9, matricula:'177009', nombreCompleto:'Miguel Díaz Rodríguez',  grupo:'3° C', puntosConducta:38, tutor:'Carmen Rodríguez',  estado:'Activo' },
  { id:10,matricula:'177010', nombreCompleto:'Elena Torres Vargas',    grupo:'1° A', puntosConducta:91, tutor:'Sergio Torres',     estado:'Activo' },
];

export default function PrefectoAlumnos() {
  const navigate    = useNavigate();
  const [q, setQ]   = useState('');
  const [grupo, setGrupo] = useState('');
  const [modalAlumno, setModalAlumno] = useState(null);

  const filtered = ALUMNOS_MOCK.filter(a => {
    const mq = a.nombreCompleto.toLowerCase().includes(q.toLowerCase()) || a.matricula.includes(q);
    const mg = !grupo || a.grupo === grupo;
    return mq && mg;
  });

  const fs = {
    padding:'9px 12px', border:'1.5px solid var(--border)', borderRadius:'var(--radius)',
    fontSize:14, background:'#fff', appearance:'none', outline:'none', cursor:'pointer',
  };
  const thS = {
    textAlign:'left', padding:'10px 14px', fontSize:13, fontWeight:600,
    color:'var(--green-800)', background:'var(--green-50)', borderBottom:'1px solid var(--border)',
  };
  const tdS = { padding:'12px 14px', borderBottom:'1px solid var(--border)', fontSize:14, verticalAlign:'middle' };

  return (
    <div style={{ padding:'0 2rem 2rem' }}>
      <PageHeader
        title="Gestión de Alumnos"
        subtitle={`Total de alumnos activos: ${filtered.length}`}
      />

      <ModalCrearReporte
        open={!!modalAlumno}
        onClose={() => setModalAlumno(null)}
        alumnoPreset={modalAlumno}
      />

      {/* Filtros */}
      <Card style={{ padding:'1rem 1.25rem', marginBottom:'1.25rem', display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:240 }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontSize:14 }}>🔍</span>
          <input value={q} onChange={e=>setQ(e.target.value)}
            placeholder="Buscar por nombre, matrícula o grupo..."
            style={{ ...fs, width:'100%', paddingLeft:36 }} />
        </div>
        <div style={{ position:'relative' }}>
          <select value={grupo} onChange={e=>setGrupo(e.target.value === 'Todos los grupos' ? '' : e.target.value)} style={{ ...fs, paddingRight:32 }}>
            {GRUPOS.map(g=><option key={g}>{g}</option>)}
          </select>
          <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', fontSize:12, color:'var(--text-muted)' }}>▾</span>
        </div>
      </Card>

      {/* Tabla */}
      <Card style={{ padding:0 }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>{['Matrícula','Nombre Completo','Grupo','Puntos Conducta','Tutor','Estado','Acciones'].map(h=>
                <th key={h} style={thS}>{h}</th>
              )}</tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
                  onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <td style={{ ...tdS, color:'var(--text-secondary)', fontSize:13 }}>{a.matricula}</td>
                  <td style={{ ...tdS, fontWeight:500 }}>{a.nombreCompleto}</td>
                  <td style={tdS}><Badge variant="success">{a.grupo}</Badge></td>
                  <td style={tdS}><PtsBadge pts={a.puntosConducta} /></td>
                  <td style={{ ...tdS, color:'var(--text-secondary)' }}>{a.tutor}</td>
                  <td style={tdS}><Badge variant="success">{a.estado}</Badge></td>
                  <td style={tdS}>
                    <div style={{ display:'flex', gap:6 }}>
                      {/* Ver historial de reportes */}
                      <button title="Ver reportes"
                        onClick={() => navigate(`/prefecto/reportes?alumno=${a.id}&nombre=${encodeURIComponent(a.nombreCompleto)}`)}
                        style={{ background:'none', border:'none', cursor:'pointer', fontSize:17, color:'var(--green-700)', padding:'3px 5px', borderRadius:6 }}
                        onMouseEnter={e=>e.currentTarget.style.background='var(--green-50)'}
                        onMouseLeave={e=>e.currentTarget.style.background=''}>👁</button>
                      {/* Crear reporte */}
                      <button title="Crear reporte"
                        onClick={() => setModalAlumno({ id:a.id, nombre:a.nombreCompleto, matricula:a.matricula, puntosConducta:a.puntosConducta })}
                        style={{ background:'none', border:'none', cursor:'pointer', fontSize:17, color:'var(--blue-600)', padding:'3px 5px', borderRadius:6 }}
                        onMouseEnter={e=>e.currentTarget.style.background='var(--blue-50)'}
                        onMouseLeave={e=>e.currentTarget.style.background=''}>✏️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding:'10px 14px', fontSize:13, color:'var(--text-secondary)', borderTop:'1px solid var(--border)' }}>
          Mostrando {filtered.length} de {ALUMNOS_MOCK.length} alumnos
        </div>
      </Card>
    </div>
  );
}
