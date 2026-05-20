// src/pages/control-escolar/Grupos.jsx
import { useState } from 'react';
import { Search, User, DoorOpen, Users, Pencil, Inbox } from 'lucide-react';
import PageHeader   from '../../components/layout/PageHeader';
import Card         from '../../components/ui/Card';
import Badge        from '../../components/ui/Badge';
import Button       from '../../components/ui/Button';
import { GRUPOS_MOCK, ASIGNACIONES_MOCK } from './_mockData';

function calColor(v) {
  if (v >= 8) return '#16a34a';
  if (v >= 7) return '#d97706';
  return '#dc2626';
}

export default function ControlEscolarGrupos() {
  const [q,     setQ]     = useState('');
  const [grado, setGrado] = useState('');

  // Filtrar grupos
  const gruposFiltrados = GRUPOS_MOCK.filter(g => {
    const mq = g.nombre.toLowerCase().includes(q.toLowerCase())
            || g.tutor.toLowerCase().includes(q.toLowerCase())
            || g.aula.toLowerCase().includes(q.toLowerCase());
    const mg = !grado || String(g.grado) === grado;
    return mq && mg;
  });

  const fs = { padding:'9px 12px', border:'1.5px solid var(--border)', borderRadius:'var(--radius)', fontSize:14, background:'#fff', appearance:'none', outline:'none', cursor:'pointer' };
  const thS = { textAlign:'left', padding:'10px 14px', fontSize:13, fontWeight:600, color:'var(--green-800)', background:'var(--green-50)', borderBottom:'1px solid var(--border)' };
  const tdS = { padding:'12px 14px', borderBottom:'1px solid var(--border)', fontSize:14, verticalAlign:'top' };

  return (
    <div style={{ padding:'0 2rem 2rem' }}>
      <PageHeader
        title="Grupos"
        subtitle={`${gruposFiltrados.length} grupos activos · Ciclo 2025-2026`}
        action={<Button>+ Nuevo Grupo</Button>}
      />

      {/* Filtros */}
      <Card style={{ padding:'1rem 1.25rem', marginBottom:'1.25rem', display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:240 }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontSize:14, display:'flex', alignItems:'center' }}><Search size={14} /></span>
          <input value={q} onChange={e=>setQ(e.target.value)}
            placeholder="Buscar por grupo, tutor o aula..."
            style={{ ...fs, width:'100%', paddingLeft:36 }} />
        </div>
        <div style={{ position:'relative' }}>
          <select value={grado} onChange={e=>setGrado(e.target.value)} style={{ ...fs, paddingRight:32 }}>
            <option value="">Todos los grados</option>
            <option value="1">1° Grado</option>
            <option value="2">2° Grado</option>
            <option value="3">3° Grado</option>
          </select>
          <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', fontSize:12, color:'var(--text-muted)' }}>▾</span>
        </div>
      </Card>

      {/* Tabla de grupos con materias expandidas */}
      {gruposFiltrados.map(grupo => {
        const asigs = ASIGNACIONES_MOCK.filter(a => a.grupo === grupo.nombre);
        return (
          <Card key={grupo.id} style={{ padding:0, marginBottom:'1.25rem' }}>
            {/* Header grupo */}
            <div style={{
              padding:'1rem 1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between',
              background:'var(--green-50)', borderRadius:'var(--radius-lg) var(--radius-lg) 0 0',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                <div style={{
                  width:44, height:44, borderRadius:'50%', background:'var(--green-700)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:16, fontWeight:700, color:'#fff', flexShrink:0,
                }}>
                  {grupo.nombre}
                </div>
                <div>
                  <div style={{ fontSize:16, fontWeight:700, color:'var(--green-800)' }}>{grupo.nombre}</div>
                  <div style={{ fontSize:13, color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:4, flexWrap:'wrap' }}>
                    <User size={13} /> Tutor: {grupo.tutor} &nbsp;·&nbsp; <DoorOpen size={13} /> Aula: {grupo.aula} &nbsp;·&nbsp; <Users size={13} /> {grupo.alumnos} alumnos
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:12, color:'var(--text-secondary)' }}>Promedio grupal</div>
                  <div style={{ fontSize:22, fontWeight:700, color:calColor(grupo.promedio) }}>{grupo.promedio.toFixed(1)}</div>
                </div>
                <Button variant="outline" icon={<Pencil size={13} />}>Editar</Button>
              </div>
            </div>

            {/* Tabla de materias del grupo */}
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr>
                    <th style={thS}>Materia</th>
                    <th style={thS}>Docente</th>
                    <th style={thS}>Aula</th>
                    <th style={thS}>Días</th>
                    <th style={thS}>Horario</th>
                    <th style={{ ...thS, width:90 }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {asigs.length === 0 ? (
                    <tr><td colSpan={6} style={{ ...tdS, textAlign:'center', color:'var(--text-muted)' }}>Sin asignaciones registradas</td></tr>
                  ) : asigs.map(a => (
                    <tr key={a.id}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
                      onMouseLeave={e=>e.currentTarget.style.background=''}>
                      <td style={{ ...tdS, fontWeight:500 }}>{a.materia}</td>
                      <td style={{ ...tdS, color:'var(--text-secondary)' }}>{a.docente}</td>
                      <td style={tdS}>{a.aula}</td>
                      <td style={{ ...tdS, color:'var(--text-secondary)' }}>{a.dias.join(', ')}</td>
                      <td style={tdS}>{a.hora}</td>
                      <td style={tdS}>
                        <Badge variant={a.periodoActivo ? 'success' : 'neutral'}>
                          {a.periodoActivo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}

      {gruposFiltrados.length === 0 && (
        <Card style={{ padding:'3rem', textAlign:'center', color:'var(--text-secondary)' }}>
          <div style={{ fontSize:40, marginBottom:12, display:'flex', justifyContent:'center' }}><Inbox size={40} /></div>
          <p>No se encontraron grupos con esos filtros.</p>
        </Card>
      )}
    </div>
  );
}
