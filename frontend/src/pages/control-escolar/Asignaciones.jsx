// src/pages/control-escolar/Asignaciones.jsx
//
// Lógica real de asignaciones en secundarias mexicanas (SEP):
//  · Un docente puede impartir 1 o más materias a distintos grupos.
//  · Cada asignación tiene: docente, materia, grupo, aula, días, hora.
//  · No puede haber dos asignaciones del mismo docente en el mismo día/hora.
//  · No puede haber dos grupos en la misma aula al mismo tiempo.

import { useState } from 'react';
import PageHeader   from '../../components/layout/PageHeader';
import Card         from '../../components/ui/Card';
import Button       from '../../components/ui/Button';
import Badge        from '../../components/ui/Badge';
import Modal        from '../../components/ui/Modal';
import { showToast } from '../../components/ui/Toast';
import {
  ASIGNACIONES_MOCK, GRUPOS_MOCK, MATERIAS_CAT, DOCENTES_MOCK,
} from './_mockData';

const DIAS_SEMANA = ['Lunes','Martes','Miércoles','Jueves','Viernes'];
const HORAS_CLASE = [
  '07:00-07:50','07:50-08:40','08:40-09:30',
  '09:50-10:40','10:40-11:30','11:30-12:20','12:20-13:10',
];
const AULAS_DISPONIBLES = [
  'A-101','A-102','A-103','B-201','B-202','B-203',
  'C-301','C-302','C-303','Lab-1','Lab-2','Patio',
];

const FORM_EMPTY = {
  docente:'', materia:'', grupo:'', aula:'',
  dias:[], hora:'', periodoActivo:true,
};

export default function ControlEscolarAsignaciones() {
  const [asignaciones, setAsignaciones] = useState(ASIGNACIONES_MOCK);
  const [modalOpen, setModalOpen]       = useState(false);
  const [form, setForm]                 = useState(FORM_EMPTY);
  const [formError, setFormError]       = useState('');
  const [qFiltro, setQFiltro]           = useState('');
  const [vista, setVista]               = useState('lista'); // 'lista' | 'horario'
  const [grupoHorario, setGrupoHorario] = useState(GRUPOS_MOCK[0].nombre);

  const fs = { padding:'9px 12px', border:'1.5px solid var(--border)', borderRadius:'var(--radius)', fontSize:14, background:'#fff', appearance:'none', outline:'none', cursor:'pointer' };
  const inputS = { width:'100%', padding:'9px 12px', border:'1.5px solid var(--border)', borderRadius:'var(--radius)', fontSize:14, outline:'none' };
  const thS = { textAlign:'left', padding:'10px 14px', fontSize:12, fontWeight:600, color:'var(--green-800)', background:'var(--green-50)', borderBottom:'1px solid var(--border)' };
  const tdS = { padding:'11px 14px', borderBottom:'1px solid var(--border)', fontSize:13, verticalAlign:'middle' };

  const filtradas = asignaciones.filter(a =>
    a.docente.toLowerCase().includes(qFiltro.toLowerCase()) ||
    a.materia.toLowerCase().includes(qFiltro.toLowerCase()) ||
    a.grupo.toLowerCase().includes(qFiltro.toLowerCase()) ||
    a.aula.toLowerCase().includes(qFiltro.toLowerCase())
  );

  // ── Validación de conflictos ────────────────────────────────
  function validarAsignacion(f) {
    for (const a of asignaciones) {
      // Mismo docente, mismo día, misma hora
      if (a.docente === f.docente && a.hora === f.hora && a.dias.some(d => f.dias.includes(d))) {
        return `El docente ${f.docente} ya tiene clase en ese horario (${a.grupo} - ${a.materia})`;
      }
      // Misma aula, mismo día, misma hora
      if (a.aula === f.aula && a.hora === f.hora && a.dias.some(d => f.dias.includes(d))) {
        return `El aula ${f.aula} ya está ocupada en ese horario (${a.grupo} - ${a.materia})`;
      }
      // Mismo grupo, mismo día, misma hora
      if (a.grupo === f.grupo && a.hora === f.hora && a.dias.some(d => f.dias.includes(d))) {
        return `El grupo ${f.grupo} ya tiene clase en ese horario (${a.materia})`;
      }
    }
    return null;
  }

  const handleGuardar = () => {
    if (!form.docente||!form.materia||!form.grupo||!form.aula||!form.hora||form.dias.length===0) {
      setFormError('Completa todos los campos obligatorios.');
      return;
    }
    const conflict = validarAsignacion(form);
    if (conflict) { setFormError(conflict); return; }

    setAsignaciones(prev => [...prev, { ...form, id: Date.now() }]);
    showToast('Asignación creada correctamente');
    setModalOpen(false);
    setForm(FORM_EMPTY);
    setFormError('');
  };

  const toggleDia = (dia) => {
    setForm(f => ({
      ...f,
      dias: f.dias.includes(dia) ? f.dias.filter(d=>d!==dia) : [...f.dias, dia],
    }));
  };

  const eliminar = (id) => {
    setAsignaciones(prev => prev.filter(a=>a.id!==id));
    showToast('Asignación eliminada', 'info');
  };

  // ── Vista horario por grupo ─────────────────────────────────
  const HORAS_HORARIO = [
    { id:1, label:'07:00-07:50' }, { id:2, label:'07:50-08:40' },
    { id:3, label:'08:40-09:30' }, { id:'R', receso:true },
    { id:4, label:'09:50-10:40' }, { id:5, label:'10:40-11:30' },
    { id:6, label:'11:30-12:20' }, { id:7, label:'12:20-13:10' },
  ];
  const HORAS_MAP = { '07:00-07:50':1,'07:50-08:40':2,'08:40-09:30':3,'09:50-10:40':4,'10:40-11:30':5,'11:30-12:20':6,'12:20-13:10':7 };
  const COLORES_MATERIA = ['#dbeafe','#dcfce7','#f3e8ff','#ffedd5','#ccfbf1','#fef3c7','#fce7f3','#e0f2fe'];
  function colorIdx(mat) { let h=0; for(const c of mat) h=(h*31+c.charCodeAt(0))%COLORES_MATERIA.length; return COLORES_MATERIA[h]; }

  const asigGrupo = filtradas.filter(a => a.grupo === grupoHorario);
  const horarioGrupo = {};
  asigGrupo.forEach(a => {
    const claseId = HORAS_MAP[a.hora];
    if (!claseId) return;
    a.dias.forEach(dia => {
      if (!horarioGrupo[dia]) horarioGrupo[dia] = {};
      horarioGrupo[dia][claseId] = a;
    });
  });

  return (
    <div style={{ padding:'0 2rem 2rem' }}>
      <PageHeader
        title="Asignaciones y Horarios"
        subtitle="Gestión de docente · materia · grupo"
        action={<Button onClick={() => { setModalOpen(true); setFormError(''); setForm(FORM_EMPTY); }}>+ Nueva Asignación</Button>}
      />

      {/* Info SEP */}
      <div style={{ background:'var(--blue-50)', border:'1px solid var(--blue-100)', borderRadius:'var(--radius)', padding:'1rem 1.25rem', marginBottom:'1.25rem' }}>
        <div style={{ fontWeight:600, color:'var(--blue-700)', fontSize:14, marginBottom:6 }}>📌 Estructura de horarios SEP — Secundaria</div>
        <div style={{ fontSize:13, color:'var(--blue-600)', lineHeight:1.6 }}>
          7 periodos de 50 min · 1 receso (09:30-09:50) · Lunes a Viernes · El sistema detecta conflictos de aula, docente y grupo automáticamente.
        </div>
      </div>

      {/* Tabs vista */}
      <div style={{ display:'flex', gap:8, marginBottom:'1.25rem' }}>
        {[['lista','📋 Lista'],['horario','📅 Horario por grupo']].map(([v,l])=>(
          <button key={v} onClick={()=>setVista(v)} style={{
            padding:'8px 18px', borderRadius:'var(--radius)', fontSize:14, fontWeight: vista===v?600:500,
            border:'1.5px solid', cursor:'pointer', fontFamily:'inherit',
            borderColor: vista===v?'var(--green-700)':'var(--border)',
            background:  vista===v?'var(--green-700)':'#fff',
            color:       vista===v?'#fff':'var(--text-secondary)',
          }}>{l}</button>
        ))}
      </div>

      {/* Filtro */}
      <Card style={{ padding:'1rem 1.25rem', marginBottom:'1.25rem', display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:240 }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontSize:14 }}>🔍</span>
          <input value={qFiltro} onChange={e=>setQFiltro(e.target.value)}
            placeholder="Buscar por materia, docente, grupo o aula..."
            style={{ ...fs, width:'100%', paddingLeft:36 }} />
        </div>
        {vista==='horario' && (
          <div style={{ position:'relative' }}>
            <select value={grupoHorario} onChange={e=>setGrupoHorario(e.target.value)} style={{ ...fs, paddingRight:32 }}>
              {GRUPOS_MOCK.map(g=><option key={g.id}>{g.nombre}</option>)}
            </select>
            <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', fontSize:12, color:'var(--text-muted)' }}>▾</span>
          </div>
        )}
      </Card>

      {/* ── Vista lista ── */}
      {vista==='lista' && (
        <Card style={{ padding:0 }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>{['Docente','Materia','Grupo','Aula','Días','Horario','Estado','Acciones'].map(h=><th key={h} style={thS}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtradas.map(a=>(
                  <tr key={a.id}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <td style={{ ...tdS, fontWeight:500 }}>{a.docente}</td>
                    <td style={tdS}>{a.materia}</td>
                    <td style={tdS}><Badge variant="success">{a.grupo}</Badge></td>
                    <td style={{ ...tdS, color:'var(--text-secondary)' }}>{a.aula}</td>
                    <td style={{ ...tdS, color:'var(--text-secondary)', fontSize:12 }}>{a.dias.join(', ')}</td>
                    <td style={tdS}>{a.hora}</td>
                    <td style={tdS}><Badge variant={a.periodoActivo?'success':'neutral'}>{a.periodoActivo?'Activo':'Inactivo'}</Badge></td>
                    <td style={tdS}>
                      <div style={{ display:'flex', gap:4 }}>
                        <button title="Editar" style={{ background:'none', border:'none', cursor:'pointer', fontSize:15, color:'var(--blue-600)', padding:'3px 5px', borderRadius:6 }}>✏️</button>
                        <button title="Eliminar" onClick={()=>eliminar(a.id)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:15, color:'var(--red-500)', padding:'3px 5px', borderRadius:6 }}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtradas.length===0&&<tr><td colSpan={8} style={{ ...tdS, textAlign:'center', color:'var(--text-muted)' }}>Sin resultados</td></tr>}
              </tbody>
            </table>
          </div>
          <div style={{ padding:'10px 14px', fontSize:13, color:'var(--text-secondary)', borderTop:'1px solid var(--border)' }}>
            {filtradas.length} asignaciones
          </div>
        </Card>
      )}

      {/* ── Vista horario ── */}
      {vista==='horario' && (
        <Card style={{ padding:0, overflowX:'auto' }}>
          <div style={{ padding:'1rem 1.25rem', background:'var(--green-50)', borderRadius:'var(--radius-lg) var(--radius-lg) 0 0', fontWeight:700, color:'var(--green-800)', fontSize:15 }}>
            Horario del grupo {grupoHorario}
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:640 }}>
            <thead>
              <tr style={{ background:'var(--green-50)' }}>
                <th style={{ ...thS, width:130 }}>Hora</th>
                {['Lunes','Martes','Miércoles','Jueves','Viernes'].map(d=>(
                  <th key={d} style={{ ...thS, textAlign:'center', borderLeft:'1px solid var(--border)' }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HORAS_HORARIO.map(hora=>{
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
                    {['Lunes','Martes','Miércoles','Jueves','Viernes'].map(dia=>{
                      const asig = horarioGrupo[dia]?.[hora.id];
                      const bg = asig ? colorIdx(asig.materia) : null;
                      return (
                        <td key={dia} style={{ padding:6, borderBottom:'1px solid var(--border)', borderLeft:'1px solid var(--border)', verticalAlign:'top', height:64 }}>
                          {asig && (
                            <div style={{ background:bg, borderRadius:'var(--radius)', padding:'7px 10px', height:'100%', border:`1.5px solid ${bg}88` }}>
                              <div style={{ fontSize:12, fontWeight:700 }}>{asig.materia}</div>
                              <div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:1 }}>{asig.docente.split('.')[1]?.trim().split(' ')[0] || asig.docente}</div>
                              <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:1 }}>Aula {asig.aula}</div>
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

      {/* Modal nueva asignación */}
      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title="Nueva Asignación" width={540}>
        {formError && (
          <div style={{ background:'var(--red-50)', border:'1px solid var(--red-100)', borderRadius:8, padding:'10px 14px', color:'var(--red-600)', fontSize:13, marginBottom:'1rem' }}>
            ⚠ {formError}
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
          {/* Docente */}
          <div>
            <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:5 }}>Docente *</label>
            <div style={{ position:'relative' }}>
              <select value={form.docente} onChange={e=>setForm(f=>({...f,docente:e.target.value}))} style={{ ...inputS, appearance:'none', paddingRight:32 }}>
                <option value="">Seleccionar...</option>
                {DOCENTES_MOCK.map(d=><option key={d.id}>{d.nombre}</option>)}
              </select>
              <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', fontSize:12, color:'var(--text-muted)' }}>▾</span>
            </div>
          </div>
          {/* Materia */}
          <div>
            <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:5 }}>Materia *</label>
            <div style={{ position:'relative' }}>
              <select value={form.materia} onChange={e=>setForm(f=>({...f,materia:e.target.value}))} style={{ ...inputS, appearance:'none', paddingRight:32 }}>
                <option value="">Seleccionar...</option>
                {MATERIAS_CAT.map(m=><option key={m}>{m}</option>)}
              </select>
              <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', fontSize:12, color:'var(--text-muted)' }}>▾</span>
            </div>
          </div>
          {/* Grupo */}
          <div>
            <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:5 }}>Grupo *</label>
            <div style={{ position:'relative' }}>
              <select value={form.grupo} onChange={e=>setForm(f=>({...f,grupo:e.target.value}))} style={{ ...inputS, appearance:'none', paddingRight:32 }}>
                <option value="">Seleccionar...</option>
                {GRUPOS_MOCK.map(g=><option key={g.id}>{g.nombre}</option>)}
              </select>
              <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', fontSize:12, color:'var(--text-muted)' }}>▾</span>
            </div>
          </div>
          {/* Aula */}
          <div>
            <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:5 }}>Aula *</label>
            <div style={{ position:'relative' }}>
              <select value={form.aula} onChange={e=>setForm(f=>({...f,aula:e.target.value}))} style={{ ...inputS, appearance:'none', paddingRight:32 }}>
                <option value="">Seleccionar...</option>
                {AULAS_DISPONIBLES.map(a=><option key={a}>{a}</option>)}
              </select>
              <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', fontSize:12, color:'var(--text-muted)' }}>▾</span>
            </div>
          </div>
        </div>

        {/* Hora */}
        <div style={{ marginBottom:'1rem' }}>
          <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:5 }}>Horario *</label>
          <div style={{ position:'relative' }}>
            <select value={form.hora} onChange={e=>setForm(f=>({...f,hora:e.target.value}))} style={{ ...inputS, appearance:'none', paddingRight:32 }}>
              <option value="">Seleccionar hora...</option>
              {HORAS_CLASE.map(h=><option key={h}>{h}</option>)}
            </select>
            <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', fontSize:12, color:'var(--text-muted)' }}>▾</span>
          </div>
        </div>

        {/* Días */}
        <div style={{ marginBottom:'1.5rem' }}>
          <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:8 }}>Días de clase *</label>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {DIAS_SEMANA.map(dia=>{
              const sel = form.dias.includes(dia);
              return (
                <button key={dia} onClick={()=>toggleDia(dia)} style={{
                  padding:'6px 14px', borderRadius:'var(--radius)', fontSize:13, fontWeight:500,
                  border:'1.5px solid', cursor:'pointer', fontFamily:'inherit',
                  borderColor: sel?'var(--green-700)':'var(--border)',
                  background:  sel?'var(--green-700)':'#fff',
                  color:       sel?'#fff':'var(--text-secondary)',
                }}>{dia.slice(0,3)}</button>
              );
            })}
          </div>
        </div>

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button onClick={()=>setModalOpen(false)} style={{ padding:'9px 18px', borderRadius:'var(--radius)', border:'1.5px solid var(--border)', background:'#fff', cursor:'pointer', fontFamily:'inherit', fontSize:14 }}>Cancelar</button>
          <Button onClick={handleGuardar}>Guardar Asignación</Button>
        </div>
      </Modal>
    </div>
  ); 
}
