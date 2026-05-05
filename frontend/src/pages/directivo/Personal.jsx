// src/pages/directivo/Personal.jsx
import { useState } from 'react';
import PageHeader   from '../../components/layout/PageHeader';
import Card         from '../../components/ui/Card';
import Badge        from '../../components/ui/Badge';
import { PERSONAL_MOCK, ROL_LABEL, ROL_VARIANT } from './_mockData';

const ROLES = ['DOCENTE','PREFECTO','SECRETARIA','CONTROL_ESCOLAR'];

export default function DirectivoPersonal() {
  const [q,   setQ]   = useState('');
  const [rol, setRol] = useState('');
  const [sel, setSel] = useState(null);

  const filtered = PERSONAL_MOCK.filter(p => {
    const mq = p.nombre.toLowerCase().includes(q.toLowerCase())
            || p.correo.toLowerCase().includes(q.toLowerCase());
    const mr = !rol || p.rol === rol;
    return mq && mr;
  });

  const fs  = { padding:'9px 12px', border:'1.5px solid var(--border)', borderRadius:'var(--radius)', fontSize:14, background:'#fff', appearance:'none', outline:'none', cursor:'pointer' };
  const thS = { textAlign:'left', padding:'10px 14px', fontSize:13, fontWeight:600, color:'var(--green-800)', background:'var(--green-50)', borderBottom:'1px solid var(--border)' };
  const tdS = { padding:'12px 14px', borderBottom:'1px solid var(--border)', fontSize:14, verticalAlign:'middle' };

  return (
    <div style={{ padding:'0 2rem 2rem' }}>
      <PageHeader title="Personal" subtitle={`${filtered.length} personas en el sistema`} />

      <Card style={{ padding:'1rem 1.25rem', marginBottom:'1.25rem', display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:280 }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontSize:14 }}>🔍</span>
          <input value={q} onChange={e=>setQ(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            style={{ ...fs, width:'100%', paddingLeft:36 }} />
        </div>
        <div style={{ position:'relative' }}>
          <select value={rol} onChange={e=>setRol(e.target.value)} style={{ ...fs, paddingRight:32 }}>
            <option value="">Todos los roles</option>
            {ROLES.map(r=><option key={r} value={r}>{ROL_LABEL[r]}</option>)}
          </select>
          <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', fontSize:12, color:'var(--text-muted)' }}>▾</span>
        </div>
      </Card>

      <div style={{ display:'grid', gridTemplateColumns: sel ? '1fr 380px' : '1fr', gap:'1.25rem', alignItems:'start' }}>
        {/* Tabla */}
        <Card style={{ padding:0 }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>{['Nombre','Rol','Materia / Área','Teléfono','Estado'].map(h=><th key={h} style={thS}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}
                    onClick={() => setSel(sel?.id === p.id ? null : p)}
                    style={{ cursor:'pointer', background: sel?.id===p.id ? 'var(--green-50)' : '' }}
                    onMouseEnter={e=>{ if(sel?.id!==p.id) e.currentTarget.style.background='var(--bg-hover)'; }}
                    onMouseLeave={e=>{ if(sel?.id!==p.id) e.currentTarget.style.background=''; }}>
                    <td style={{ ...tdS, fontWeight:500 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--green-100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'var(--green-800)', flexShrink:0 }}>
                          {p.nombre.charAt(0)}
                        </div>
                        {p.nombre}
                      </div>
                    </td>
                    <td style={tdS}><Badge variant={ROL_VARIANT[p.rol] || 'neutral'}>{ROL_LABEL[p.rol] || p.rol}</Badge></td>
                    <td style={{ ...tdS, color:'var(--text-secondary)' }}>{p.materia}</td>
                    <td style={{ ...tdS, color:'var(--blue-600)', fontSize:13 }}>{p.telefono}</td>
                    <td style={tdS}><Badge variant="success">{p.estado}</Badge></td>
                  </tr>
                ))}
                {filtered.length===0 && <tr><td colSpan={5} style={{ ...tdS, textAlign:'center', color:'var(--text-muted)' }}>Sin resultados.</td></tr>}
              </tbody>
            </table>
          </div>
          <div style={{ padding:'10px 14px', fontSize:13, color:'var(--text-secondary)', borderTop:'1px solid var(--border)' }}>
            {filtered.length} personas · Haz clic en una fila para ver detalles
          </div>
        </Card>

        {/* Panel de detalle */}
        {sel && (
          <Card style={{ padding:'1.5rem', position:'sticky', top:80 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
              <h3 style={{ fontSize:16, fontWeight:700 }}>Información</h3>
              <button onClick={() => setSel(null)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:'var(--text-muted)' }}>✕</button>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:'1.25rem', paddingBottom:'1rem', borderBottom:'1px solid var(--border)' }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--green-100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, color:'var(--green-800)' }}>
                {sel.nombre.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize:16, fontWeight:700 }}>{sel.nombre}</div>
                <Badge variant={ROL_VARIANT[sel.rol] || 'neutral'}>{ROL_LABEL[sel.rol] || sel.rol}</Badge>
              </div>
            </div>
            {[
              { label:'Materia / Área', value:sel.materia },
              { label:'Teléfono',       value:sel.telefono },
              { label:'Correo',         value:sel.correo   },
              { label:'Estado',         value:sel.estado   },
            ].map(f => (
              <div key={f.label} style={{ marginBottom:'0.75rem' }}>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>{f.label}</div>
                <div style={{ fontSize:14, color:'var(--text-primary)' }}>{f.value}</div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
