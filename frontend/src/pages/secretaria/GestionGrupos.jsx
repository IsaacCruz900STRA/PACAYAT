// src/pages/secretaria/GestionGrupos.jsx
import { useState } from 'react';
import PageHeader   from '../../components/layout/PageHeader';
import Card         from '../../components/ui/Card';
import Badge        from '../../components/ui/Badge';
import { ALUMNOS_MOCK, TUTORES_MOCK, GRUPOS_LISTA, ptsBadgeStyle } from './_mockData';

function getTutor(tutorId) {
  return TUTORES_MOCK.find(t => t.id === tutorId);
}

export default function SecretariaGrupos() {
  const [grupoSel, setGrupoSel] = useState(GRUPOS_LISTA[0]);
  const [q,        setQ]        = useState('');

  const alumnosGrupo = ALUMNOS_MOCK.filter(a => {
    const mg = a.grupo === grupoSel;
    const mq = !q || a.nombre.toLowerCase().includes(q.toLowerCase()) || a.matricula.includes(q);
    return mg && mq;
  });

  const resumen = {
    total:    alumnosGrupo.length,
    activos:  alumnosGrupo.filter(a=>a.estado==='Activo').length,
    enRiesgo: alumnosGrupo.filter(a=>a.puntos<60).length,
    promedio: alumnosGrupo.length ? Math.round(alumnosGrupo.reduce((s,a)=>s+a.puntos,0)/alumnosGrupo.length) : 0,
  };

  const fs  = { padding:'9px 12px', border:'1.5px solid var(--border)', borderRadius:'var(--radius)', fontSize:14, background:'#fff', appearance:'none', outline:'none', cursor:'pointer' };
  const thS = { textAlign:'left', padding:'10px 14px', fontSize:13, fontWeight:600, color:'var(--green-800)', background:'var(--green-50)', borderBottom:'1px solid var(--border)' };
  const tdS = { padding:'12px 14px', borderBottom:'1px solid var(--border)', fontSize:14, verticalAlign:'middle' };

  return (
    <div style={{ padding:'0 2rem 2rem' }}>
      <PageHeader
        title="Grupos"
        subtitle={`Grupo ${grupoSel} · ${resumen.total} alumnos`}
      />

      {/* Selector de grupo — tabs */}
      <div style={{ marginBottom:'1.25rem' }}>
        <div style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', marginBottom:8 }}>Seleccionar grupo:</div>

        {/* Grado 1° */}
        {[['1°',['1° A','1° B','1° C']],['2°',['2° A','2° B','2° C']],['3°',['3° A','3° B','3° C']]].map(([grado, lista]) => (
          <div key={grado} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', width:28, flexShrink:0 }}>{grado}</span>
            {lista.map(g => {
              const active = grupoSel === g;
              const count  = ALUMNOS_MOCK.filter(a=>a.grupo===g).length;
              return (
                <button key={g} onClick={()=>{ setGrupoSel(g); setQ(''); }}
                  style={{
                    padding:'6px 16px', borderRadius:'var(--radius)', fontSize:13, fontWeight:active?700:500,
                    border:'1.5px solid', cursor:'pointer', fontFamily:'inherit',
                    borderColor: active?'var(--green-700)':'var(--border)',
                    background:  active?'var(--green-700)':'#fff',
                    color:       active?'#fff':'var(--text-secondary)',
                    display:'flex', alignItems:'center', gap:6,
                  }}>
                  {g}
                  <span style={{ fontSize:11, opacity:0.8 }}>({count})</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Resumen del grupo */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.25rem' }}>
        {[
          { label:'Total alumnos',  value:resumen.total,    color:'var(--text-primary)' },
          { label:'Activos',        value:resumen.activos,  color:'#16a34a' },
          { label:'En riesgo',      value:resumen.enRiesgo, color:'#dc2626' },
          { label:'Promedio conducta',value:`${resumen.promedio} pts`, color: resumen.promedio>=70?'#16a34a':resumen.promedio>=55?'#d97706':'#dc2626' },
        ].map(s => (
          <Card key={s.label} style={{ padding:'1rem', textAlign:'center' }}>
            <div style={{ fontSize:22, fontWeight:700, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:3 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Buscador dentro del grupo */}
      <Card style={{ padding:'1rem 1.25rem', marginBottom:'1.25rem' }}>
        <div style={{ position:'relative' }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontSize:14 }}>🔍</span>
          <input value={q} onChange={e=>setQ(e.target.value)}
            placeholder={`Buscar en ${grupoSel} por nombre o matrícula...`}
            style={{ ...fs, width:'100%', paddingLeft:36 }} />
        </div>
      </Card>

      {/* Tabla de alumnos del grupo */}
      <Card style={{ padding:0 }}>
        <div style={{ padding:'1rem 1.25rem', background:'var(--green-50)', borderRadius:'var(--radius-lg) var(--radius-lg) 0 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h3 style={{ fontSize:16, fontWeight:700, color:'var(--green-800)' }}>Grupo {grupoSel}</h3>
          <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{alumnosGrupo.length} alumnos</span>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>{['Matrícula','Nombre Completo','Puntos Conducta','Tutor','Teléfono','Estado'].map(h=><th key={h} style={thS}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {alumnosGrupo.map(a => {
                const tutor = getTutor(a.tutorId);
                const { bg, color } = ptsBadgeStyle(a.puntos);
                return (
                  <tr key={a.id}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <td style={{ ...tdS, color:'var(--text-secondary)', fontSize:13 }}>{a.matricula}</td>
                    <td style={{ ...tdS, fontWeight:500 }}>{a.nombre}</td>
                    <td style={tdS}>
                      <span style={{ background:bg, color, fontSize:13, fontWeight:700, padding:'4px 12px', borderRadius:20 }}>
                        {a.puntos} pts
                      </span>
                    </td>
                    <td style={{ ...tdS, fontSize:13 }}>{tutor?.nombre || '—'}</td>
                    <td style={{ ...tdS, color:'var(--blue-600)', fontSize:13 }}>{tutor?.telefono || '—'}</td>
                    <td style={tdS}><Badge variant="success">{a.estado}</Badge></td>
                  </tr>
                );
              })}
              {alumnosGrupo.length===0 && (
                <tr><td colSpan={6} style={{ ...tdS, textAlign:'center', color:'var(--text-muted)', padding:'2rem' }}>
                  No se encontraron alumnos con ese criterio de búsqueda.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ padding:'10px 14px', fontSize:13, color:'var(--text-secondary)', borderTop:'1px solid var(--border)' }}>
          {alumnosGrupo.length} alumnos en {grupoSel}
        </div>
      </Card>
    </div>
  );
}
