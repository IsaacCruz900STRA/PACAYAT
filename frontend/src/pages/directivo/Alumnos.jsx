// src/pages/directivo/Alumnos.jsx
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card       from '../../components/ui/Card';
import Badge      from '../../components/ui/Badge';
import api        from '../../api/client';
import { ptsBadgeStyle } from './_mockData';

const GRUPOS = ['1° A','1° B','1° C','2° A','2° B','2° C','3° A','3° B','3° C'];

export default function DirectivoAlumnos() {
  const [alumnos,       setAlumnos]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [q,             setQ]             = useState('');
  const [grupo,         setGrupo]         = useState('');
  const [sel,           setSel]           = useState(null);
  const [selDetail,     setSelDetail]     = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    api.get('/alumnos', { params: { limit: 200 } })
      .then(({ data }) => setAlumnos(data?.alumnos || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = alumnos.filter(a => {
    const mq = a.nombreCompleto.toLowerCase().includes(q.toLowerCase())
            || a.matricula.includes(q)
            || (a.grupo || '').toLowerCase().includes(q.toLowerCase());
    const mg = !grupo || a.grupo === grupo;
    return mq && mg;
  });

  function handleSelect(alumno) {
    if (sel?.id === alumno.id) {
      setSel(null);
      setSelDetail(null);
      return;
    }
    setSel(alumno);
    setSelDetail(null);
    setLoadingDetail(true);
    api.get(`/alumnos/${alumno.id}`)
      .then(({ data }) => setSelDetail(data))
      .catch(() => setSelDetail(null))
      .finally(() => setLoadingDetail(false));
  }

  const fs  = { padding:'9px 12px', border:'1.5px solid var(--border)', borderRadius:'var(--radius)', fontSize:14, background:'#fff', appearance:'none', outline:'none', cursor:'pointer' };
  const thS = { textAlign:'left', padding:'10px 14px', fontSize:13, fontWeight:600, color:'var(--green-800)', background:'var(--green-50)', borderBottom:'1px solid var(--border)' };
  const tdS = { padding:'12px 14px', borderBottom:'1px solid var(--border)', fontSize:14, verticalAlign:'middle' };

  if (loading) {
    return (
      <div style={{ padding:'0 2rem 2rem' }}>
        <PageHeader title="Gestión de Alumnos" subtitle="Cargando..." />
        <Card style={{ padding:'2rem', textAlign:'center', color:'var(--text-secondary)' }}>Cargando alumnos...</Card>
      </div>
    );
  }

  return (
    <div style={{ padding:'0 2rem 2rem' }}>
      <PageHeader title="Gestión de Alumnos" subtitle={`Total de alumnos: ${filtered.length}`} />

      <Card style={{ padding:'1rem 1.25rem', marginBottom:'1.25rem', display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:280 }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontSize:14, display:'flex', alignItems:'center' }}><Search size={14} /></span>
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Buscar por nombre, matrícula o grupo..."
            style={{ ...fs, width:'100%', paddingLeft:36 }} />
        </div>
        <div style={{ position:'relative' }}>
          <select value={grupo} onChange={e => setGrupo(e.target.value)} style={{ ...fs, paddingRight:32 }}>
            <option value="">Todos los grupos</option>
            {GRUPOS.map(g => <option key={g}>{g}</option>)}
          </select>
          <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', fontSize:12, color:'var(--text-muted)' }}>▾</span>
        </div>
      </Card>

      <div style={{ display:'grid', gridTemplateColumns: sel ? '1fr 380px' : '1fr', gap:'1.25rem', alignItems:'start' }}>
        <Card style={{ padding:0 }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>{['Matrícula','Nombre Completo','Grupo','Puntos Conducta','Tutor','Estado'].map(h => <th key={h} style={thS}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const { bg, color } = ptsBadgeStyle(a.puntosConducta);
                  return (
                    <tr key={a.id}
                      onClick={() => handleSelect(a)}
                      style={{ cursor:'pointer', background: sel?.id === a.id ? 'var(--green-50)' : '' }}
                      onMouseEnter={e => { if (sel?.id !== a.id) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                      onMouseLeave={e => { if (sel?.id !== a.id) e.currentTarget.style.background = ''; }}>
                      <td style={{ ...tdS, color:'var(--text-secondary)', fontSize:13 }}>{a.matricula}</td>
                      <td style={{ ...tdS, fontWeight:500 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--green-100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'var(--green-800)', flexShrink:0 }}>
                            {a.nombreCompleto.charAt(0)}
                          </div>
                          {a.nombreCompleto}
                        </div>
                      </td>
                      <td style={tdS}><Badge variant="success">{a.grupo}</Badge></td>
                      <td style={tdS}><span style={{ background:bg, color, fontSize:13, fontWeight:700, padding:'4px 12px', borderRadius:20 }}>{a.puntosConducta} pts</span></td>
                      <td style={{ ...tdS, color:'var(--text-secondary)', fontSize:13 }}>{a.tutor}</td>
                      <td style={tdS}><Badge variant={a.activo ? 'success' : 'neutral'}>{a.estado}</Badge></td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ ...tdS, textAlign:'center', color:'var(--text-muted)' }}>Sin resultados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ padding:'10px 14px', fontSize:13, color:'var(--text-secondary)', borderTop:'1px solid var(--border)' }}>
            Mostrando {filtered.length} de {alumnos.length} alumnos · Haz clic en una fila para ver detalles
          </div>
        </Card>

        {sel && (
          <Card style={{ padding:'1.5rem', position:'sticky', top:80 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
              <h3 style={{ fontSize:16, fontWeight:700 }}>Información del Alumno</h3>
              <button onClick={() => { setSel(null); setSelDetail(null); }}
                style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:'var(--text-muted)', display:'flex', alignItems:'center' }}><X size={18} /></button>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:'1.25rem', paddingBottom:'1rem', borderBottom:'1px solid var(--border)' }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--green-100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, color:'var(--green-800)' }}>
                {sel.nombreCompleto.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize:16, fontWeight:700 }}>{sel.nombreCompleto}</div>
                <Badge variant="success">{sel.grupo}</Badge>
              </div>
            </div>

            {[
              { label:'Matrícula',          value: sel.matricula },
              { label:'Grado',              value: sel.grado ? `${sel.grado}° Grado` : '—' },
              { label:'Puntos de conducta', value: (() => { const { bg, color } = ptsBadgeStyle(sel.puntosConducta); return <span style={{ background:bg, color, fontSize:13, fontWeight:700, padding:'4px 12px', borderRadius:20 }}>{sel.puntosConducta} pts</span>; })() },
              { label:'Estado',             value: <Badge variant={sel.activo ? 'success' : 'neutral'}>{sel.estado}</Badge> },
            ].map(f => (
              <div key={f.label} style={{ marginBottom:'0.75rem' }}>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>{f.label}</div>
                <div style={{ fontSize:14, color:'var(--text-primary)' }}>{f.value}</div>
              </div>
            ))}

            {selDetail?.domicilio && (
              <div style={{ marginBottom:'0.75rem' }}>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>Domicilio</div>
                <div style={{ fontSize:14, color:'var(--text-primary)' }}>{selDetail.domicilio}</div>
              </div>
            )}

            <div style={{ marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid var(--border)' }}>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:'0.75rem', color:'var(--text-primary)' }}>Tutor</div>
              {loadingDetail ? (
                <div style={{ fontSize:13, color:'var(--text-muted)' }}>Cargando información del tutor...</div>
              ) : (
                [
                  { label:'Nombre',   value: selDetail?.tutor?.nombreCompleto || sel.tutor || '—' },
                  { label:'Teléfono', value: selDetail?.tutor?.telefono || '—' },
                  { label:'Correo',   value: selDetail?.tutor?.correo   || '—' },
                ].map(f => (
                  <div key={f.label} style={{ marginBottom:'0.75rem' }}>
                    <div style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>{f.label}</div>
                    <div style={{ fontSize:14, color:'var(--text-primary)' }}>{f.value}</div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
