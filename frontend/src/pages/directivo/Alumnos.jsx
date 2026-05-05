// src/pages/directivo/Alumnos.jsx
import { useState }   from 'react';
import PageHeader      from '../../components/layout/PageHeader';
import Card            from '../../components/ui/Card';
import Badge           from '../../components/ui/Badge';
import { ALUMNOS_MOCK, ptsBadgeStyle } from './_mockData';

const GRUPOS = ['1° A','1° B','1° C','2° A','2° B','2° C','3° A','3° B','3° C'];

export default function DirectivoAlumnos() {
  const [q,     setQ]     = useState('');
  const [grupo, setGrupo] = useState('');

  const filtered = ALUMNOS_MOCK.filter(a => {
    const mq = a.nombre.toLowerCase().includes(q.toLowerCase()) || a.matricula.includes(q);
    const mg = !grupo || a.grupo === grupo;
    return mq && mg;
  });

  const fs  = { padding:'9px 12px', border:'1.5px solid var(--border)', borderRadius:'var(--radius)', fontSize:14, background:'#fff', appearance:'none', outline:'none', cursor:'pointer' };
  const thS = { textAlign:'left', padding:'10px 14px', fontSize:13, fontWeight:600, color:'var(--green-800)', background:'var(--green-50)', borderBottom:'1px solid var(--border)' };
  const tdS = { padding:'12px 14px', borderBottom:'1px solid var(--border)', fontSize:14, verticalAlign:'middle' };

  return (
    <div style={{ padding:'0 2rem 2rem' }}>
      <PageHeader title="Gestión de Alumnos" subtitle={`Total de alumnos activos: ${filtered.length}`} />

      <Card style={{ padding:'1rem 1.25rem', marginBottom:'1.25rem', display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:280 }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontSize:14 }}>🔍</span>
          <input value={q} onChange={e=>setQ(e.target.value)}
            placeholder="Buscar por nombre, matrícula o grupo..."
            style={{ ...fs, width:'100%', paddingLeft:36 }} />
        </div>
        <div style={{ position:'relative' }}>
          <select value={grupo} onChange={e=>setGrupo(e.target.value)} style={{ ...fs, paddingRight:32 }}>
            <option value="">Todos los grupos</option>
            {GRUPOS.map(g=><option key={g}>{g}</option>)}
          </select>
          <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', fontSize:12, color:'var(--text-muted)' }}>▾</span>
        </div>
      </Card>

      <Card style={{ padding:0 }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>{['Matrícula','Nombre Completo','Grupo','Puntos Conducta','Tutor','Estado'].map(h=><th key={h} style={thS}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const { bg, color } = ptsBadgeStyle(a.puntos);
                return (
                  <tr key={a.id}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <td style={{ ...tdS, color:'var(--text-secondary)', fontSize:13 }}>{a.matricula}</td>
                    <td style={{ ...tdS, fontWeight:500 }}>{a.nombre}</td>
                    <td style={tdS}><Badge variant="success">{a.grupo}</Badge></td>
                    <td style={tdS}><span style={{ background:bg, color, fontSize:13, fontWeight:700, padding:'4px 12px', borderRadius:20 }}>{a.puntos} pts</span></td>
                    <td style={{ ...tdS, color:'var(--text-secondary)', fontSize:13 }}>{a.tutor}</td>
                    <td style={tdS}><Badge variant="success">{a.estado}</Badge></td>
                  </tr>
                );
              })}
              {filtered.length===0 && <tr><td colSpan={6} style={{ ...tdS, textAlign:'center', color:'var(--text-muted)' }}>Sin resultados.</td></tr>}
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
