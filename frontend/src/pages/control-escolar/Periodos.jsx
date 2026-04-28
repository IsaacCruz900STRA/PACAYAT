// src/pages/control-escolar/Periodos.jsx
import { useState } from 'react';
import PageHeader    from '../../components/layout/PageHeader';
import Card          from '../../components/ui/Card';
import Button        from '../../components/ui/Button';
import Badge         from '../../components/ui/Badge';
import Modal         from '../../components/ui/Modal';
import { showToast } from '../../components/ui/Toast';
import { PERIODOS_MOCK } from './_mockData';

const ESTADO_STYLES = {
  ACTIVO:  { variant:'success', label:'Activo', dot:true  },
  CERRADO: { variant:'neutral', label:'Cerrado', dot:false },
  PROXIMO: { variant:'info',    label:'Próximo', dot:false },
};

const FORM_EMPTY = { nombre:'', fechaInicio:'', fechaFin:'', estado:'PROXIMO' };

export default function ControlEscolarPeriodos() {
  const [periodos,   setPeriodos]   = useState(PERIODOS_MOCK);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editando,   setEditando]   = useState(null); // periodo a editar
  const [form,       setForm]       = useState(FORM_EMPTY);
  const [formError,  setFormError]  = useState('');

  const abrirNuevo = () => {
    setEditando(null);
    setForm(FORM_EMPTY);
    setFormError('');
    setModalOpen(true);
  };

  const abrirEditar = (p) => {
    setEditando(p);
    setForm({ nombre:p.nombre, fechaInicio:p.fechaInicio, fechaFin:p.fechaFin, estado:p.estado });
    setFormError('');
    setModalOpen(true);
  };

  const validar = () => {
    if (!form.nombre.trim())      return 'El nombre es obligatorio.';
    if (!form.fechaInicio)        return 'La fecha de inicio es obligatoria.';
    if (!form.fechaFin)           return 'La fecha de fin es obligatoria.';
    if (form.fechaInicio >= form.fechaFin) return 'La fecha de fin debe ser posterior a la de inicio.';
    return null;
  };

  const handleGuardar = () => {
    const err = validar();
    if (err) { setFormError(err); return; }

    if (editando) {
      setPeriodos(prev => prev.map(p => p.id===editando.id ? { ...p, ...form } : p));
      showToast('Periodo actualizado correctamente');
    } else {
      setPeriodos(prev => [...prev, { ...form, id: Date.now() }]);
      showToast('Periodo creado correctamente');
    }
    setModalOpen(false);
  };

  const activar = (id) => {
    setPeriodos(prev => prev.map(p => ({
      ...p, estado: p.id===id ? 'ACTIVO' : p.estado==='ACTIVO' ? 'CERRADO' : p.estado
    })));
    showToast('Periodo activado');
  };

  const thS = { textAlign:'left', padding:'10px 14px', fontSize:13, fontWeight:600, color:'var(--green-800)', background:'var(--green-50)', borderBottom:'1px solid var(--border)' };
  const tdS = { padding:'12px 14px', borderBottom:'1px solid var(--border)', fontSize:14, verticalAlign:'middle' };
  const inputS = { width:'100%', padding:'9px 12px', border:'1.5px solid var(--border)', borderRadius:'var(--radius)', fontSize:14, outline:'none' };

  const periodoActivo = periodos.find(p=>p.estado==='ACTIVO');

  return (
    <div style={{ padding:'0 2rem 2rem' }}>
      <PageHeader
        title="Periodos de Evaluación"
        subtitle="Configura las fechas de captura de calificaciones"
        action={<Button onClick={abrirNuevo}>+ Nuevo Periodo</Button>}
      />

      {/* Banner periodo activo */}
      {periodoActivo && (
        <div style={{ background:'var(--green-50)', border:'1px solid var(--green-200)', borderRadius:'var(--radius-lg)', padding:'1rem 1.25rem', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:22 }}>✅</span>
          <div>
            <div style={{ fontWeight:700, color:'var(--green-800)', fontSize:15 }}>Periodo activo: {periodoActivo.nombre}</div>
            <div style={{ fontSize:13, color:'var(--green-700)', marginTop:2 }}>
              {periodoActivo.fechaInicio} al {periodoActivo.fechaFin} — Los docentes pueden capturar calificaciones en este periodo.
            </div>
          </div>
        </div>
      )}

      {/* Reglas */}
      <div style={{ background:'var(--blue-50)', border:'1px solid var(--blue-100)', borderRadius:'var(--radius)', padding:'1rem 1.25rem', marginBottom:'1.5rem' }}>
        <div style={{ fontWeight:600, color:'var(--blue-700)', fontSize:14, marginBottom:4 }}>📌 Reglas de periodos</div>
        <ul style={{ fontSize:13, color:'var(--blue-600)', lineHeight:1.8, paddingLeft:16 }}>
          <li>Solo puede haber un periodo <strong>Activo</strong> a la vez.</li>
          <li>Los docentes solo pueden capturar calificaciones en el periodo <strong>Activo</strong>.</li>
          <li>Control Escolar puede editar calificaciones de cualquier periodo.</li>
          <li>Al activar un periodo, el anterior pasa a <strong>Cerrado</strong> automáticamente.</li>
        </ul>
      </div>

      {/* Tabla */}
      <Card style={{ padding:0 }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr>{['Periodo','Fecha Inicio','Fecha Fin','Duración','Estado','Acciones'].map(h=><th key={h} style={thS}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {periodos.map(p=>{
              const { variant, label, dot } = ESTADO_STYLES[p.estado] || ESTADO_STYLES.PROXIMO;
              const ini  = new Date(p.fechaInicio);
              const fin  = new Date(p.fechaFin);
              const dias = Math.round((fin-ini)/(1000*60*60*24));
              return (
                <tr key={p.id}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
                  onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <td style={{ ...tdS, fontWeight:600 }}>{p.nombre}</td>
                  <td style={{ ...tdS, color:'var(--text-secondary)' }}>{p.fechaInicio}</td>
                  <td style={{ ...tdS, color:'var(--text-secondary)' }}>{p.fechaFin}</td>
                  <td style={{ ...tdS, color:'var(--text-secondary)' }}>{dias} días</td>
                  <td style={tdS}><Badge variant={variant} dot={dot}>{label}</Badge></td>
                  <td style={tdS}>
                    <div style={{ display:'flex', gap:6 }}>
                      {p.estado!=='ACTIVO' && (
                        <button onClick={()=>activar(p.id)} title="Activar periodo" style={{ background:'var(--green-50)', border:'1px solid var(--green-200)', color:'var(--green-700)', fontSize:12, fontWeight:600, padding:'4px 10px', borderRadius:6, cursor:'pointer' }}>
                          ▶ Activar
                        </button>
                      )}
                      <button onClick={()=>abrirEditar(p)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:15, color:'var(--blue-600)', padding:'3px 5px', borderRadius:6 }}>✏️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ padding:'10px 14px', fontSize:13, color:'var(--text-secondary)', borderTop:'1px solid var(--border)' }}>
          {periodos.length} periodos configurados · Ciclo 2025-2026
        </div>
      </Card>

      {/* Línea de tiempo visual */}
      <Card style={{ padding:'1.25rem', marginTop:'1.25rem' }}>
        <h3 style={{ fontSize:15, fontWeight:700, marginBottom:'1.25rem' }}>📅 Línea de tiempo del ciclo</h3>
        <div style={{ display:'flex', gap:0, alignItems:'stretch' }}>
          {periodos.map((p,i)=>{
            const colors = {
              ACTIVO:  { bg:'var(--green-700)', border:'var(--green-700)', text:'#fff' },
              CERRADO: { bg:'#e5e7eb',           border:'#d1d5db',         text:'#374151' },
              PROXIMO: { bg:'#dbeafe',           border:'#93c5fd',         text:'#1e40af' },
            };
            const c = colors[p.estado] || colors.PROXIMO;
            return (
              <div key={p.id} style={{ flex:1, position:'relative' }}>
                <div style={{
                  background:c.bg, border:`1.5px solid ${c.border}`,
                  borderRadius: i===0 ? '8px 0 0 8px' : i===periodos.length-1 ? '0 8px 8px 0' : 0,
                  padding:'10px 12px', textAlign:'center', color:c.text, height:'100%',
                }}>
                  <div style={{ fontSize:13, fontWeight:700 }}>{p.nombre}</div>
                  <div style={{ fontSize:11, marginTop:3, opacity:0.85 }}>{p.fechaInicio}</div>
                  <div style={{ fontSize:11, opacity:0.85 }}>→ {p.fechaFin}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Modal crear/editar */}
      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editando ? 'Editar Periodo' : 'Nuevo Periodo'} width={460}>
        {formError && (
          <div style={{ background:'var(--red-50)', border:'1px solid var(--red-100)', borderRadius:8, padding:'10px 14px', color:'var(--red-600)', fontSize:13, marginBottom:'1rem' }}>
            ⚠ {formError}
          </div>
        )}

        <div style={{ marginBottom:'1rem' }}>
          <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:5 }}>Nombre del periodo *</label>
          <input value={form.nombre} onChange={e=>setForm(f=>({...f,nombre:e.target.value}))}
            placeholder="Ej: Periodo 1, Parcial 1, Bimestre 1..."
            style={inputS}
            onFocus={e=>e.target.style.borderColor='var(--green-600)'}
            onBlur={e=>e.target.style.borderColor='var(--border)'}
          />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
          <div>
            <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:5 }}>Fecha de inicio *</label>
            <input type="date" value={form.fechaInicio} onChange={e=>setForm(f=>({...f,fechaInicio:e.target.value}))}
              style={inputS}
              onFocus={e=>e.target.style.borderColor='var(--green-600)'}
              onBlur={e=>e.target.style.borderColor='var(--border)'}
            />
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:5 }}>Fecha de fin *</label>
            <input type="date" value={form.fechaFin} onChange={e=>setForm(f=>({...f,fechaFin:e.target.value}))}
              style={inputS}
              onFocus={e=>e.target.style.borderColor='var(--green-600)'}
              onBlur={e=>e.target.style.borderColor='var(--border)'}
            />
          </div>
        </div>

        <div style={{ marginBottom:'1.5rem' }}>
          <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:5 }}>Estado inicial</label>
          <div style={{ position:'relative' }}>
            <select value={form.estado} onChange={e=>setForm(f=>({...f,estado:e.target.value}))}
              style={{ ...inputS, appearance:'none', paddingRight:32, cursor:'pointer' }}
              onFocus={e=>e.target.style.borderColor='var(--green-600)'}
              onBlur={e=>e.target.style.borderColor='var(--border)'}>
              <option value="PROXIMO">Próximo</option>
              <option value="ACTIVO">Activo</option>
              <option value="CERRADO">Cerrado</option>
            </select>
            <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', fontSize:12, color:'var(--text-muted)' }}>▾</span>
          </div>
        </div>

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button onClick={()=>setModalOpen(false)} style={{ padding:'9px 18px', borderRadius:'var(--radius)', border:'1.5px solid var(--border)', background:'#fff', cursor:'pointer', fontFamily:'inherit', fontSize:14 }}>Cancelar</button>
          <Button onClick={handleGuardar}>{editando ? 'Actualizar' : 'Crear Periodo'}</Button>
        </div>
      </Modal>
    </div>
  );
}
