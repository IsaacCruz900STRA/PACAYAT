// src/pages/secretaria/GestionTutores.jsx
import { useState } from 'react';
import { Search, Eye, Pencil } from 'lucide-react';
import PageHeader   from '../../components/layout/PageHeader';
import Card         from '../../components/ui/Card';
import Badge        from '../../components/ui/Badge';
import Button       from '../../components/ui/Button';
import Modal        from '../../components/ui/Modal';
import { showToast } from '../../components/ui/Toast';
import { ALUMNOS_MOCK, TUTORES_MOCK, GRUPOS_LISTA, ptsBadgeStyle } from './_mockData';

// Enriquecer tutores con sus tutorados
function getTutorados(tutorId) {
  return ALUMNOS_MOCK.filter(a => a.tutorId === tutorId);
}

export default function SecretariaTutores() {
  const [q,      setQ]      = useState('');
  const [grupo,  setGrupo]  = useState('');
  const [modal,  setModal]  = useState(null);   // tutor seleccionado para ver/editar
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);

  // Filtro: por nombre del tutor, nombre del alumno tutorado o matrícula
  const filtered = TUTORES_MOCK.filter(t => {
    const tutorados = getTutorados(t.id);
    const matchQ = !q
      || t.nombre.toLowerCase().includes(q.toLowerCase())
      || tutorados.some(a =>
          a.nombre.toLowerCase().includes(q.toLowerCase()) ||
          a.matricula.includes(q)
        );
    const matchG = !grupo
      || tutorados.some(a => a.grupo === grupo);
    return matchQ && matchG;
  });

  const abrirModal = (tutor) => {
    setModal(tutor);
    setEditForm({ nombre:tutor.nombre, telefono:tutor.telefono, correo:tutor.correo, parentesco:tutor.parentesco });
  };

  const handleGuardar = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600)); // simular petición
    showToast('Datos del tutor actualizados');
    setSaving(false);
    setModal(null);
  };

  const fs   = { padding:'9px 12px', border:'1.5px solid var(--border)', borderRadius:'var(--radius)', fontSize:14, background:'#fff', appearance:'none', outline:'none', cursor:'pointer' };
  const thS  = { textAlign:'left', padding:'10px 14px', fontSize:13, fontWeight:600, color:'var(--green-800)', background:'var(--green-50)', borderBottom:'1px solid var(--border)' };
  const tdS  = { padding:'12px 14px', borderBottom:'1px solid var(--border)', fontSize:14, verticalAlign:'middle' };
  const inp  = { width:'100%', padding:'9px 12px', border:'1.5px solid var(--border)', borderRadius:'var(--radius)', fontSize:14, outline:'none', fontFamily:'inherit' };

  return (
    <div style={{ padding:'0 2rem 2rem' }}>
      <PageHeader
        title="Gestión de Tutores"
        subtitle={`${filtered.length} tutores registrados`}
        action={<Button>+ Nuevo Tutor</Button>}
      />

      {/* Filtros */}
      <Card style={{ padding:'1rem 1.25rem', marginBottom:'1.25rem', display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:280 }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontSize:14, display:'flex', alignItems:'center' }}><Search size={14} /></span>
          <input value={q} onChange={e=>setQ(e.target.value)}
            placeholder="Buscar por nombre del tutor, alumno o matrícula..."
            style={{ ...fs, width:'100%', paddingLeft:36 }} />
        </div>
        <div style={{ position:'relative' }}>
          <select value={grupo} onChange={e=>setGrupo(e.target.value)} style={{ ...fs, paddingRight:32 }}>
            <option value="">Todos los grupos</option>
            {GRUPOS_LISTA.map(g=><option key={g}>{g}</option>)}
          </select>
          <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', fontSize:12, color:'var(--text-muted)' }}>▾</span>
        </div>
      </Card>

      {/* Tabla */}
      <Card style={{ padding:0 }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>{['Tutor','Parentesco','Teléfono','Correo','Tutorado(s)','Grupo(s)','Acciones'].map(h=><th key={h} style={thS}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const tutorados = getTutorados(t.id);
                return (
                  <tr key={t.id}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    {/* Tutor */}
                    <td style={tdS}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--green-100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:'var(--green-800)', flexShrink:0 }}>
                          {t.nombre.charAt(0)}
                        </div>
                        <span style={{ fontWeight:500 }}>{t.nombre}</span>
                      </div>
                    </td>
                    <td style={tdS}><Badge variant="neutral">{t.parentesco}</Badge></td>
                    {/* Teléfono */}
                    <td style={{ ...tdS, color:'var(--blue-600)', fontWeight:500 }}>{t.telefono}</td>
                    {/* Correo */}
                    <td style={{ ...tdS, color:'var(--text-secondary)', fontSize:13 }}>{t.correo}</td>
                    {/* Tutorados */}
                    <td style={tdS}>
                      <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                        {tutorados.map(a => (
                          <div key={a.id} style={{ fontSize:13 }}>
                            <span style={{ fontWeight:500 }}>{a.nombre}</span>
                            <span style={{ fontSize:11, color:'var(--text-muted)', marginLeft:4 }}>{a.matricula}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    {/* Grupos */}
                    <td style={tdS}>
                      <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                        {tutorados.map(a => (
                          <Badge key={a.id} variant="success">{a.grupo}</Badge>
                        ))}
                      </div>
                    </td>
                    {/* Acciones */}
                    <td style={tdS}>
                      <div style={{ display:'flex', gap:6 }}>
                        <button title="Ver / Editar"
                          onClick={() => abrirModal(t)}
                          style={{ background:'none', border:'none', cursor:'pointer', fontSize:17, color:'var(--green-700)', padding:'3px 5px', borderRadius:6, display:'flex', alignItems:'center' }}
                          onMouseEnter={e=>e.currentTarget.style.background='var(--green-50)'}
                          onMouseLeave={e=>e.currentTarget.style.background=''}><Eye size={17} /></button>
                        <button title="Editar"
                          onClick={() => abrirModal(t)}
                          style={{ background:'none', border:'none', cursor:'pointer', fontSize:17, color:'var(--blue-600)', padding:'3px 5px', borderRadius:6, display:'flex', alignItems:'center' }}
                          onMouseEnter={e=>e.currentTarget.style.background='var(--blue-50)'}
                          onMouseLeave={e=>e.currentTarget.style.background=''}><Pencil size={17} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length===0 && (
                <tr><td colSpan={7} style={{ ...tdS, textAlign:'center', color:'var(--text-muted)' }}>Sin resultados para los filtros aplicados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ padding:'10px 14px', fontSize:13, color:'var(--text-secondary)', borderTop:'1px solid var(--border)' }}>
          Mostrando {filtered.length} de {TUTORES_MOCK.length} tutores
        </div>
      </Card>

      {/* Modal ver/editar tutor */}
      {modal && editForm && (
        <Modal open={!!modal} onClose={() => setModal(null)} title="Información del Tutor" width={560}>
          {/* Datos del tutor */}
          <div style={{ marginBottom:'1.25rem', paddingBottom:'1.25rem', borderBottom:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'1.25rem' }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--green-100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, color:'var(--green-800)' }}>
                {modal.nombre.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize:18, fontWeight:700 }}>{modal.nombre}</div>
                <Badge variant="neutral">{modal.parentesco}</Badge>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:5 }}>NOMBRE COMPLETO</label>
                <input value={editForm.nombre} onChange={e=>setEditForm(f=>({...f,nombre:e.target.value}))}
                  style={inp}
                  onFocus={e=>e.target.style.borderColor='var(--green-600)'}
                  onBlur={e=>e.target.style.borderColor='var(--border)'} />
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:5 }}>PARENTESCO</label>
                <div style={{ position:'relative' }}>
                  <select value={editForm.parentesco} onChange={e=>setEditForm(f=>({...f,parentesco:e.target.value}))}
                    style={{ ...inp, appearance:'none', paddingRight:32, cursor:'pointer' }}
                    onFocus={e=>e.target.style.borderColor='var(--green-600)'}
                    onBlur={e=>e.target.style.borderColor='var(--border)'}>
                    {['Madre','Padre','Tutor legal','Abuelo/a','Otro'].map(p=><option key={p}>{p}</option>)}
                  </select>
                  <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', fontSize:12, color:'var(--text-muted)' }}>▾</span>
                </div>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:5 }}>TELÉFONO</label>
                <input value={editForm.telefono} onChange={e=>setEditForm(f=>({...f,telefono:e.target.value}))}
                  style={inp}
                  onFocus={e=>e.target.style.borderColor='var(--green-600)'}
                  onBlur={e=>e.target.style.borderColor='var(--border)'} />
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:5 }}>CORREO ELECTRÓNICO</label>
                <input value={editForm.correo} onChange={e=>setEditForm(f=>({...f,correo:e.target.value}))}
                  type="email" style={inp}
                  onFocus={e=>e.target.style.borderColor='var(--green-600)'}
                  onBlur={e=>e.target.style.borderColor='var(--border)'} />
              </div>
            </div>
          </div>

          {/* Tutorados */}
          <div style={{ marginBottom:'1.5rem' }}>
            <h4 style={{ fontSize:14, fontWeight:700, marginBottom:'0.75rem', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
              Alumnos a su cargo
            </h4>
            {getTutorados(modal.id).map(a => {
              const { bg, color } = ptsBadgeStyle(a.puntos);
              return (
                <div key={a.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight:500, fontSize:14 }}>{a.nombre}</div>
                    <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:2 }}>
                      Matrícula: {a.matricula} &nbsp;·&nbsp; Grupo: {a.grupo}
                    </div>
                  </div>
                  <span style={{ background:bg, color, fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>
                    {a.puntos} pts
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
            <button onClick={() => setModal(null)} style={{ padding:'9px 18px', borderRadius:'var(--radius)', border:'1.5px solid var(--border)', background:'#fff', cursor:'pointer', fontFamily:'inherit', fontSize:14 }}>
              Cancelar
            </button>
            <Button onClick={handleGuardar} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
