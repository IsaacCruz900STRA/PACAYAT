// src/pages/admin/Horarios.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import Card   from '../../components/ui/Card';
import api    from '../../api/client';
import { importarPDF, guardarImportados } from '../../api/horarios';
import HorarioImportGrid from '../../components/horarios/HorarioImportGrid';

// ─── Modal de confirmación con cuenta atrás ───────────────────────────────────
function ModalConfirmacion({ totalBloques, totalGrupos, onConfirm, onCancel }) {
  const [segundos, setSegundos] = useState(5);

  useEffect(() => {
    if (segundos <= 0) return;
    const t = setTimeout(() => setSegundos(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [segundos]);

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,.55)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999,
    }}>
      <div style={{
        background:'#fff', borderRadius:14, padding:'2rem 2.25rem',
        width:'100%', maxWidth:460, boxShadow:'0 12px 48px rgba(0,0,0,.22)',
      }}>
        {/* Icono */}
        <div style={{ fontSize:44, textAlign:'center', marginBottom:12 }}>⚠️</div>

        {/* Título */}
        <div style={{ fontSize:18, fontWeight:800, color:'#111827', textAlign:'center', marginBottom:8 }}>
          ¿Confirmar guardado de horarios?
        </div>

        {/* Descripción */}
        <div style={{ fontSize:14, color:'#374151', textAlign:'center', lineHeight:1.6, marginBottom:6 }}>
          Se guardarán <strong>{totalBloques}</strong> bloques en <strong>{totalGrupos}</strong> grupos.
        </div>
        <div style={{
          fontSize:13, color:'#7f1d1d', background:'#fef2f2',
          border:'1px solid #fecaca', borderRadius:8, padding:'10px 14px',
          textAlign:'center', marginBottom:'1.5rem',
        }}>
          Esta acción <strong>borrará todos los horarios existentes</strong> y los reemplazará con los del PDF importado.
        </div>

        {/* Cuenta atrás visual */}
        {segundos > 0 && (
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'1.25rem' }}>
            <div style={{
              width:52, height:52, borderRadius:'50%',
              border:'3px solid #166534', display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:22, fontWeight:800, color:'#166534',
            }}>
              {segundos}
            </div>
          </div>
        )}

        {/* Botones */}
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button onClick={onCancel} style={{
            padding:'10px 22px', borderRadius:8, border:'1.5px solid #d1d5db',
            background:'#fff', fontSize:14, cursor:'pointer', fontFamily:'inherit', fontWeight:600,
          }}>
            Cancelar
          </button>
          <button
            disabled={segundos > 0}
            onClick={onConfirm}
            style={{
              padding:'10px 26px', borderRadius:8, border:'none',
              background: segundos > 0 ? '#86efac' : '#166534',
              color:'#fff', fontSize:14, fontWeight:700,
              cursor: segundos > 0 ? 'not-allowed' : 'pointer',
              fontFamily:'inherit',
              transition:'background .3s',
            }}
          >
            {segundos > 0 ? `Aceptar (${segundos}s)` : 'Aceptar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Paleta y colores ─────────────────────────────────────────────────────────
const PALETTE = [
  { bg:'#DBEAFE', border:'#93C5FD', text:'#1E40AF' },
  { bg:'#D1FAE5', border:'#6EE7B7', text:'#065F46' },
  { bg:'#F3E8FF', border:'#D8B4FE', text:'#6B21A8' },
  { bg:'#FFEDD5', border:'#FDBA74', text:'#C2410C' },
  { bg:'#CCFBF1', border:'#5EEAD4', text:'#0F766E' },
  { bg:'#FEF3C7', border:'#FCD34D', text:'#92400E' },
  { bg:'#FCE7F3', border:'#F9A8D4', text:'#9D174D' },
  { bg:'#FEE2E2', border:'#FCA5A5', text:'#991B1B' },
];
function colorMat(mat) {
  if (!mat) return PALETTE[0];
  let h = 0; for (const c of mat) h = (h * 31 + c.charCodeAt(0)) % PALETTE.length;
  return PALETTE[h];
}
function colorGrupo(g) {
  if (!g) return PALETTE[0];
  let h = 0; for (const c of g) h = (h * 31 + c.charCodeAt(0)) % PALETTE.length;
  return PALETTE[h];
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const BLOQUES = [
  { n:1, label:'07:00 - 07:50' }, { n:2, label:'07:50 - 08:40' }, { n:3, label:'08:40 - 09:30' },
  { n:4, label:'10:00 - 10:50' }, { n:5, label:'10:50 - 11:40' }, { n:6, label:'11:40 - 12:30' },
  { n:7, label:'12:30 - 13:20' }, { n:8, label:'13:20 - 14:10' }, { n:9, label:'14:10 - 15:00' },
];
const DIAS      = ['Lunes','Martes','Miércoles','Jueves','Viernes'];
const DIA_LABEL = { LUNES:'Lunes', MARTES:'Martes', MIERCOLES:'Miércoles', JUEVES:'Jueves', VIERNES:'Viernes' };

function toGrid(horarios) {
  const g = {};
  for (const h of (horarios || [])) {
    const dia  = DIA_LABEL[h.dia] || h.dia;
    const slot = h.numeroClase;
    if (!g[dia]) g[dia] = {};
    g[dia][slot] = {
      materia: h.asignacion?.materia?.nombre || '—',
      docente: h.asignacion?.docente?.nombre || '',
      grupo:   h.asignacion?.grupo?.nombre   || '',
      salon:   h.salon || '—',
    };
  }
  return g;
}

// ─── Tabla de visualización (sin DnD) ────────────────────────────────────────
function TablaHorario({ grid, modo }) {
  const thS = {
    padding:'8px 10px', textAlign:'center', fontSize:11, fontWeight:700,
    color:'var(--green-800)', background:'var(--green-50)',
    borderBottom:'1.5px solid var(--border)', borderLeft:'1px solid var(--border)',
  };
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', minWidth:640 }}>
        <thead>
          <tr>
            <th style={{ ...thS, textAlign:'left', borderLeft:'none', width:110 }}>Bloque</th>
            {DIAS.map(d => <th key={d} style={thS}>{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {BLOQUES.map((bloque, i) => {
            const rows = [];
            if (i === 3) rows.push(
              <tr key="receso">
                <td colSpan={6} style={{ padding:'4px 10px', background:'#f1f5f9', textAlign:'center', fontSize:10, fontWeight:700, color:'var(--text-muted)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
                  RECESO · 09:30 – 10:00
                </td>
              </tr>
            );
            rows.push(
              <tr key={bloque.n}>
                <td style={{ padding:'5px 8px', borderBottom:'1px solid var(--border)', background:'#fafafa', whiteSpace:'nowrap' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#1B7A3D' }}>Bloque {bloque.n}</div>
                  <div style={{ fontSize:9, color:'var(--text-muted)' }}>{bloque.label}</div>
                </td>
                {DIAS.map(dia => {
                  const c   = grid[dia]?.[bloque.n];
                  const col = c ? (modo === 'grupo' ? colorMat(c.materia) : colorGrupo(c.grupo)) : null;
                  return (
                    <td key={dia} style={{ padding:4, borderBottom:'1px solid var(--border)', borderLeft:'1px solid var(--border)', verticalAlign:'top', height:60 }}>
                      {c && col && (
                        <div style={{ background:col.bg, border:`1.5px solid ${col.border}`, borderRadius:6, padding:'5px 7px', height:'100%', overflow:'hidden' }}>
                          <div style={{ fontSize:11, fontWeight:700, color:col.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.materia}</div>
                          {modo === 'docente' && c.grupo   && <div style={{ fontSize:10, fontWeight:600, color:col.text, opacity:.85, marginTop:1 }}>{c.grupo}</div>}
                          {modo === 'grupo'   && c.docente && <div style={{ fontSize:10, color:col.text, opacity:.7, marginTop:1 }}>{c.docente}</div>}
                          <div style={{ fontSize:9, color:col.text, opacity:.5, marginTop:1 }}>Salón {c.salon}</div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
            return rows;
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Drop zone para subir PDF ─────────────────────────────────────────────────
function DropZonePDF({ onFile, loading, progress }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  function handleDrop(e) {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf' || f?.name?.endsWith('.pdf')) onFile(f);
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !loading && inputRef.current?.click()}
      style={{
        border: `2.5px dashed ${dragging ? '#166534' : '#d1d5db'}`,
        borderRadius: 12, padding: '3rem 2rem', textAlign: 'center',
        background: dragging ? '#f0fdf4' : '#fafafa', cursor: loading ? 'default' : 'pointer',
        transition: 'all .2s',
      }}
    >
      <input ref={inputRef} type="file" accept=".pdf,application/pdf"
        style={{ display:'none' }} onChange={e => { const f = e.target.files[0]; if (f) onFile(f); }} />

      {loading ? (
        <div>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#166534', marginBottom: 8 }}>Procesando PDF…</div>
          {progress > 0 && (
            <div style={{ maxWidth: 280, margin: '0 auto' }}>
              <div style={{ background: '#e5e7eb', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, background: '#166534', height: '100%', transition: 'width .3s' }} />
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>{progress}%</div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 52, marginBottom: 12 }}>📄</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
            {dragging ? 'Suelta el PDF aquí' : 'Arrastra el PDF o haz clic para seleccionarlo'}
          </div>
          <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
            Archivo generado por <strong>aSc Horarios</strong><br />
            El sistema extraerá automáticamente los horarios de todos los grupos
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function AdminHorarios() {
  const [tab,       setTab]       = useState('importar');
  const [grupos,    setGrupos]    = useState([]);
  const [grado,     setGrado]     = useState('1');
  const [grupoId,   setGrupoId]   = useState(null);
  const [grid,      setGrid]      = useState({});
  const [docentes,  setDocentes]  = useState([]);
  const [docId,     setDocId]     = useState('');
  const [gridDoc,   setGridDoc]   = useState({});
  const [resumen,   setResumen]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [loadGrid,  setLoadGrid]  = useState(false);

  // Estado importación
  const [importLoading, setImportLoading]   = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importData,  setImportData]        = useState(null); // { grupos, docentes }
  const [importError, setImportError]       = useState(null);
  const [guardando,   setGuardando]         = useState(false);
  const [guardadoOk,  setGuardadoOk]        = useState(null);
  const [periodos,    setPeriodos]           = useState([]);
  const [idPeriodo,   setIdPeriodo]          = useState('');
  const [confirmar,   setConfirmar]          = useState(null); // { grupos } o null

  // Carga inicial
  useEffect(() => {
    Promise.all([
      api.get('/horarios/resumen').catch(() => ({ data: { tieneHorario:false, gruposConHorario:[], docentesConHorario:[], warnings:[], totalGrupos:0, totalDocentes:0 } })),
      api.get('/grupos').catch(()=>({ data:{ grupos:[] } })),
      api.get('/personal', { params:{ rol:'DOCENTE' } }).catch(()=>({ data:{ personal:[] } })),
      api.get('/periodos').catch(()=>({ data:[] })),
    ]).then(([rRes, rGrp, rPer, rPer2]) => {
      setResumen(rRes.data);
      const g = Array.isArray(rGrp.data) ? rGrp.data : (rGrp.data?.grupos || []);
      setGrupos(g);
      setDocentes(rPer.data?.personal || []);
      const ps = Array.isArray(rPer2.data) ? rPer2.data : [];
      setPeriodos(ps);
      const activo = ps.find(p => p.activo);
      if (activo) setIdPeriodo(String(activo.id));
    }).finally(() => setLoading(false));
  }, []);

  // Auto-seleccionar primer grupo del grado
  useEffect(() => {
    if (!grupos.length) return;
    const primero = grupos.find(g => String(g.grado) === grado);
    if (primero) setGrupoId(primero.id);
  }, [grado, grupos]);

  // Cargar horario del grupo
  useEffect(() => {
    if (!grupoId) { setGrid({}); return; }
    setLoadGrid(true);
    api.get('/horarios', { params:{ idGrupo: grupoId } })
      .then(({ data }) => setGrid(toGrid(data.horarios || [])))
      .catch(() => setGrid({}))
      .finally(() => setLoadGrid(false));
  }, [grupoId]);

  // Cargar horario del docente
  const cargarDocente = useCallback((id) => {
    if (!id) { setGridDoc({}); return; }
    api.get(`/horarios/docente-grid/${id}`)
      .then(({ data }) => setGridDoc(data.grid || {}))
      .catch(() => setGridDoc({}));
  }, []);

  // ── Importación ─────────────────────────────────────────────────────────────
  async function handlePDF(file) {
    setImportLoading(true); setImportError(null); setImportData(null); setImportProgress(0); setGuardadoOk(null);
    try {
      const { data } = await importarPDF(file, setImportProgress);
      setImportData(data);
    } catch (e) {
      setImportError(e.response?.data?.message || 'Error al procesar el PDF');
    } finally {
      setImportLoading(false);
    }
  }

  // El clic en "Guardar horarios" abre el modal de confirmación
  function handlePedirConfirmacion(gruposEditados) {
    setConfirmar({ grupos: gruposEditados });
  }

  // El usuario confirmó → guardar en BD
  async function handleGuardar() {
    if (!confirmar) return;
    const gruposEditados = confirmar.grupos;
    setConfirmar(null);
    setGuardando(true); setGuardadoOk(null); setImportError(null);
    try {
      const { data } = await guardarImportados({
        grupos: gruposEditados,
        idPeriodoEscolar: idPeriodo ? parseInt(idPeriodo) : undefined,
        limpiarTodo:   true,  // borrar TODOS los horarios antes de guardar
        limpiarGrupos: true,
      });
      setGuardadoOk(data);
      api.get('/horarios/resumen').then(r => setResumen(r.data)).catch(()=>{});
    } catch (e) {
      setImportError(e.response?.data?.message || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  }

  const gruposFiltrados = grupos.filter(g => String(g.grado) === grado);
  const grupoActual     = grupos.find(g => g.id === grupoId);

  // ── Helpers de UI ───────────────────────────────────────────────────────────
  const tabBtn = (id, icon, label) => (
    <button key={id} onClick={()=>setTab(id)} style={{
      padding:'8px 18px', borderRadius:'var(--radius)', fontSize:13, fontWeight:600,
      border:'none', cursor:'pointer', fontFamily:'inherit',
      background: tab===id ? 'var(--green-700)' : 'transparent',
      color:      tab===id ? '#fff' : 'var(--text-secondary)',
    }}>{icon} {label}</button>
  );

  if (loading) return (
    <div style={{ padding:'0 2rem 2rem' }}>
      <div style={{ paddingTop:'1.5rem', marginBottom:'1.5rem' }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', margin:0 }}>Horarios</h1>
      </div>
      <Card style={{ padding:'3rem', textAlign:'center', color:'var(--text-secondary)' }}>Cargando…</Card>
    </div>
  );

  return (
    <div style={{ padding:'0 2rem 2rem' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12, marginBottom:'1.5rem', paddingTop:'1.5rem' }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', margin:0 }}>Horarios</h1>
          <p style={{ fontSize:13, color:'var(--text-secondary)', marginTop:4 }}>Importar, revisar y gestionar horarios escolares</p>
        </div>
        {resumen?.tieneHorario && (
          <span style={{ fontSize:13, color:'var(--text-secondary)' }}>
            {resumen.totalGruposConHorario}/{resumen.totalGrupos} grupos con horario
          </span>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, background:'#f3f4f6', borderRadius:'var(--radius-lg)', padding:4, width:'fit-content', marginBottom:'1.5rem' }}>
        {tabBtn('importar', '📤', 'Importar PDF')}
        {tabBtn('grupos',   '📋', 'Por Grupo')}
        {tabBtn('docentes', '🧑‍🏫', 'Por Docente')}
        {tabBtn('resumen',  '📊', 'Resumen')}
      </div>

      {/* ── TAB: IMPORTAR ── */}
      {tab === 'importar' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

          {/* Selector de periodo */}
          {periodos.length > 0 && (
            <Card style={{ padding:'1rem 1.25rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                <label style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>
                  Ciclo escolar:
                </label>
                <select value={idPeriodo} onChange={e => setIdPeriodo(e.target.value)}
                  style={{ padding:'8px 12px', border:'1.5px solid var(--border)', borderRadius:'var(--radius)', fontSize:13, fontFamily:'inherit', background:'#fff' }}>
                  <option value="">— Sin ciclo —</option>
                  {periodos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}{p.activo ? ' (activo)' : ''}</option>
                  ))}
                </select>
              </div>
            </Card>
          )}

          {/* Drop zone */}
          {!importData && (
            <Card style={{ padding:'1.5rem' }}>
              <DropZonePDF onFile={handlePDF} loading={importLoading} progress={importProgress} />
              {importError && (
                <div style={{ marginTop:'1rem', padding:'12px 16px', background:'#fef2f2', border:'1.5px solid #fecaca', borderRadius:'var(--radius)', color:'#991b1b', fontSize:13 }}>
                  {importError}
                </div>
              )}
            </Card>
          )}

          {/* Resultado: grid editable */}
          {importData && !guardadoOk && (
            <Card style={{ padding:'1.25rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:8 }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>
                    PDF procesado — {importData.grupos.length} grupos encontrados
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:2 }}>
                    Revisa el horario, arrastra tarjetas para mover clases o doble clic para editar.
                  </div>
                </div>
                <button onClick={() => { setImportData(null); setImportError(null); }}
                  style={{ padding:'7px 16px', borderRadius:'var(--radius)', border:'1.5px solid var(--border)', background:'#fff', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
                  Cargar otro PDF
                </button>
              </div>

              {importError && (
                <div style={{ marginBottom:'1rem', padding:'10px 14px', background:'#fef2f2', border:'1.5px solid #fecaca', borderRadius:'var(--radius)', color:'#991b1b', fontSize:13 }}>
                  {importError}
                </div>
              )}

              <HorarioImportGrid
                grupos={importData.grupos}
                docentes={importData.docentes || []}
                onGuardar={handlePedirConfirmacion}
                guardando={guardando}
              />
            </Card>
          )}

          {/* Éxito */}
          {guardadoOk && (
            <Card style={{ padding:'2.5rem', textAlign:'center' }}>
              <div style={{ fontSize:56, marginBottom:12 }}>✅</div>
              <div style={{ fontSize:18, fontWeight:700, color:'#166534', marginBottom:6 }}>
                {guardadoOk.message}
              </div>
              {guardadoOk.errores?.length > 0 && (
                <div style={{ marginTop:12, textAlign:'left', maxWidth:480, margin:'12px auto 0' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'#92400e', marginBottom:6 }}>Advertencias:</div>
                  {guardadoOk.errores.map((e,i) => (
                    <div key={i} style={{ fontSize:12, color:'#78350f', padding:'4px 8px', background:'#fef3c7', borderRadius:4, marginBottom:3 }}>{e}</div>
                  ))}
                </div>
              )}
              <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:'1.5rem' }}>
                <button onClick={() => { setImportData(null); setGuardadoOk(null); setImportError(null); }}
                  style={{ padding:'10px 24px', borderRadius:8, border:'1.5px solid #d1d5db', background:'#fff', fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>
                  Importar otro PDF
                </button>
                <button onClick={() => setTab('grupos')}
                  style={{ padding:'10px 24px', borderRadius:8, border:'none', background:'#166534', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                  Ver horarios
                </button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── TAB: POR GRUPO ── */}
      {tab === 'grupos' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {!resumen?.tieneHorario ? (
            <Card style={{ padding:'4rem', textAlign:'center' }}>
              <div style={{ fontSize:52, marginBottom:12 }}>📋</div>
              <div style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>Sin horarios registrados</div>
              <div style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:16 }}>Importa el PDF de aSc Horarios para comenzar.</div>
              <button onClick={()=>setTab('importar')} style={{ padding:'9px 22px', borderRadius:8, border:'none', background:'#166534', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                Ir a importar PDF
              </button>
            </Card>
          ) : (
            <>
              <Card style={{ padding:'1rem 1.25rem' }}>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
                  <div style={{ display:'flex', gap:4 }}>
                    {['1','2','3'].map(g => (
                      <button key={g} onClick={()=>setGrado(g)} style={{
                        padding:'6px 18px', borderRadius:'var(--radius)', border:'1.5px solid', fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:'inherit',
                        borderColor: grado===g ? 'var(--green-700)' : 'var(--border)',
                        background:  grado===g ? 'var(--green-700)' : '#fff',
                        color:       grado===g ? '#fff' : 'var(--text-secondary)',
                      }}>{g}°</button>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                    {gruposFiltrados.map(g => (
                      <button key={g.id} onClick={()=>setGrupoId(g.id)} style={{
                        padding:'5px 13px', borderRadius:'var(--radius)', border:'1.5px solid', fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'inherit',
                        borderColor: grupoId===g.id ? 'var(--green-700)' : 'var(--border)',
                        background:  grupoId===g.id ? 'var(--green-50)' : '#fff',
                        color:       grupoId===g.id ? 'var(--green-800)' : 'var(--text-secondary)',
                      }}>{g.nombre}</button>
                    ))}
                  </div>
                </div>
              </Card>

              {loadGrid ? (
                <Card style={{ padding:'2rem', textAlign:'center', color:'var(--text-secondary)' }}>Cargando horario…</Card>
              ) : !grupoId ? (
                <Card style={{ padding:'2rem', textAlign:'center', color:'var(--text-secondary)' }}>Selecciona un grupo</Card>
              ) : Object.keys(grid).length === 0 ? (
                <Card style={{ padding:'2rem', textAlign:'center', color:'var(--text-secondary)' }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>📋</div>
                  <div style={{ fontWeight:600 }}>Sin horario para {grupoActual?.nombre}</div>
                </Card>
              ) : (
                <Card style={{ padding:0, overflow:'hidden' }}>
                  <div style={{ padding:'10px 16px', background:'var(--green-50)', borderBottom:'1.5px solid var(--border)' }}>
                    <div style={{ fontSize:14, fontWeight:700, color:'var(--green-800)' }}>{grupoActual?.nombre}</div>
                  </div>
                  <div style={{ padding:'1rem' }}>
                    <TablaHorario grid={grid} modo="grupo" />
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* ── TAB: POR DOCENTE ── */}
      {tab === 'docentes' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <Card style={{ padding:'1rem 1.25rem' }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>Selecciona un docente</div>
            <select value={docId} onChange={e=>{ setDocId(e.target.value); cargarDocente(e.target.value); }}
              style={{ padding:'9px 13px', border:'1.5px solid var(--border)', borderRadius:'var(--radius)', fontSize:14, background:'#fff', cursor:'pointer', width:'100%', maxWidth:400 }}>
              <option value="">— Seleccionar —</option>
              {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </Card>

          {docId && Object.keys(gridDoc).length === 0 ? (
            <Card style={{ padding:'2rem', textAlign:'center', color:'var(--text-secondary)' }}>Sin horario asignado para este docente</Card>
          ) : docId ? (
            <Card style={{ padding:0, overflow:'hidden' }}>
              <div style={{ padding:'10px 16px', background:'var(--green-50)', borderBottom:'1.5px solid var(--border)' }}>
                <div style={{ fontSize:14, fontWeight:700, color:'var(--green-800)' }}>
                  {docentes.find(d=>String(d.id)===String(docId))?.nombre}
                </div>
              </div>
              <div style={{ padding:'1rem' }}>
                <TablaHorario grid={gridDoc} modo="docente" />
              </div>
            </Card>
          ) : (
            <Card style={{ padding:'3rem', textAlign:'center', color:'var(--text-secondary)' }}>
              <div style={{ fontSize:36, marginBottom:10 }}>🧑‍🏫</div>
              <div style={{ fontWeight:600 }}>Selecciona un docente para ver su horario</div>
            </Card>
          )}
        </div>
      )}

      {/* ── TAB: RESUMEN ── */}
      {tab === 'resumen' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'1rem' }}>
            {[
              { icon:'📋', v:`${resumen?.totalGruposConHorario ?? 0}/${resumen?.totalGrupos ?? 0}`,    l:'Grupos con horario' },
              { icon:'🧑‍🏫', v:`${resumen?.totalDocentesConHorario ?? 0}/${resumen?.totalDocentes ?? 0}`, l:'Docentes con horario' },
              { icon:'📅', v: resumen?.totalHorarios ?? 0,                                              l:'Bloques asignados' },
            ].map(s => (
              <Card key={s.l} style={{ padding:'1rem 1.25rem' }}>
                <div style={{ fontSize:22, marginBottom:4 }}>{s.icon}</div>
                <div style={{ fontSize:24, fontWeight:800, color:'var(--green-800)' }}>{s.v}</div>
                <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:2 }}>{s.l}</div>
              </Card>
            ))}
          </div>
          {resumen?.warnings?.length > 0 && (
            <Card style={{ padding:'1.25rem' }}>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:10, color:'#92400e' }}>⚠️ Grupos sin horario</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {resumen.warnings.map((w,i) => (
                  <div key={i} style={{ padding:'5px 10px', background:'#fef3c7', border:'1px solid #fcd34d', borderRadius:6, fontSize:12, color:'#78350f' }}>
                    {w.replace('Grupo ','').replace(' sin horario asignado','')}
                  </div>
                ))}
              </div>
            </Card>
          )}
          {(!resumen?.tieneHorario) && (
            <Card style={{ padding:'2rem', textAlign:'center' }}>
              <button onClick={()=>setTab('importar')} style={{ padding:'10px 24px', borderRadius:8, border:'none', background:'#166534', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                Importar horario desde PDF
              </button>
            </Card>
          )}
        </div>
      )}

      {/* ── Modal de confirmación con cuenta atrás ── */}
      {confirmar && (
        <ModalConfirmacion
          totalBloques={confirmar.grupos.reduce((s, g) => {
            let n = 0;
            for (const slots of Object.values(g.grid || {}))
              for (const c of Object.values(slots)) if (c?.materia) n++;
            return s + n;
          }, 0)}
          totalGrupos={confirmar.grupos.length}
          onConfirm={handleGuardar}
          onCancel={() => setConfirmar(null)}
        />
      )}
    </div>
  );
}
