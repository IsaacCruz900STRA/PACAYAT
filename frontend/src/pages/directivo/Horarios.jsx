// src/pages/directivo/Horarios.jsx
// El directivo ve el horario de todos los grupos por grado.
// También puede buscar a un docente específico para ver su agenda semanal.
import { useState, useEffect, useRef } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card       from '../../components/ui/Card';
import HorarioGrid, { BLOQUES_9, RECESO_9, DIAS_DEFAULT } from '../../components/horarios/HorarioGrid';
import api from '../../api/client';

const DIA_LABEL = { LUNES:'Lunes',MARTES:'Martes',MIERCOLES:'Miércoles',JUEVES:'Jueves',VIERNES:'Viernes' };

function toGrid(horarios = []) {
  const g = {};
  for (const h of horarios) {
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

// ── Tab: horario por grupo ────────────────────────────────────────────────────
function TabGrupos({ grupos }) {
  const [grado,    setGrado]    = useState('1');
  const [grupoId,  setGrupoId]  = useState(null);
  const [grid,     setGrid]     = useState({});
  const [loadGrid, setLoadGrid] = useState(false);
  const [sinDatos, setSinDatos] = useState(false);

  useEffect(() => {
    if (!grupos.length) return;
    const primero = grupos.find(g => String(g.grado) === grado);
    if (primero) setGrupoId(primero.id);
    else setGrupoId(null);
  }, [grado, grupos]);

  useEffect(() => {
    if (!grupoId) { setGrid({}); return; }
    setLoadGrid(true); setSinDatos(false);
    api.get('/horarios', { params: { idGrupo: grupoId } })
      .then(({ data }) => {
        setGrid(toGrid(data.horarios || []));
        setSinDatos(!data.horarios?.length);
      })
      .catch(() => { setGrid({}); setSinDatos(true); })
      .finally(() => setLoadGrid(false));
  }, [grupoId]);

  const gruposFiltrados = grupos.filter(g => String(g.grado) === grado);
  const grupoActual     = grupos.find(g => g.id === grupoId);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
      <Card style={{ padding:'1rem 1.25rem' }}>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ display:'flex', gap:4 }}>
            {['1','2','3'].map(g => (
              <button key={g} onClick={() => setGrado(g)} style={{
                padding:'7px 20px', borderRadius:'var(--radius)', border:'1.5px solid',
                fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit',
                borderColor: grado===g ? 'var(--green-700)' : 'var(--border)',
                background:  grado===g ? 'var(--green-700)' : '#fff',
                color:       grado===g ? '#fff' : 'var(--text-secondary)',
              }}>{g}°</button>
            ))}
          </div>
          <div style={{ width:1, height:28, background:'var(--border)' }} />
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {gruposFiltrados.map(g => (
              <button key={g.id} onClick={() => setGrupoId(g.id)} style={{
                padding:'6px 14px', borderRadius:'var(--radius)', border:'1.5px solid',
                fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'inherit',
                borderColor: grupoId===g.id ? 'var(--green-700)' : 'var(--border)',
                background:  grupoId===g.id ? 'var(--green-50)' : '#fff',
                color:       grupoId===g.id ? 'var(--green-800)' : 'var(--text-secondary)',
              }}>{g.nombre}</button>
            ))}
          </div>
        </div>
      </Card>

      {loadGrid ? (
        <Card style={{ padding:'2.5rem', textAlign:'center', color:'var(--text-secondary)' }}>Cargando horario…</Card>
      ) : sinDatos ? (
        <Card style={{ padding:'3rem', textAlign:'center' }}>
          <div style={{ fontSize:36, marginBottom:10 }}>📋</div>
          <div style={{ fontWeight:600 }}>Sin horario para {grupoActual?.nombre}</div>
          <div style={{ fontSize:13, color:'var(--text-secondary)', marginTop:4 }}>Importa el PDF en Administración &gt; Horarios.</div>
        </Card>
      ) : Object.keys(grid).length > 0 ? (
        <Card style={{ padding:0, overflow:'hidden' }}>
          <HorarioGrid
            grid={grid}
            bloques={BLOQUES_9}
            receso={RECESO_9}
            dias={DIAS_DEFAULT}
            modo="grupo"
            titulo={grupoActual?.nombre}
            subtitulo={`${grado}° Grado`}
          />
        </Card>
      ) : (
        <Card style={{ padding:'3rem', textAlign:'center', color:'var(--text-secondary)' }}>
          <div style={{ fontSize:40, marginBottom:10 }}>📅</div>
          <div style={{ fontWeight:600 }}>Selecciona un grupo</div>
        </Card>
      )}
    </div>
  );
}

// ── Tab: horario por docente ──────────────────────────────────────────────────
function TabDocentes({ docentes }) {
  const [docId,    setDocId]    = useState('');
  const [gridDoc,  setGridDoc]  = useState({});
  const [horData,  setHorData]  = useState(null);
  const [loadGrid, setLoadGrid] = useState(false);

  const cargar = (id) => {
    if (!id) { setGridDoc({}); setHorData(null); return; }
    setLoadGrid(true);
    api.get(`/horarios/docente-grid/${id}`)
      .then(({ data }) => { setGridDoc(data.grid || {}); setHorData(data); })
      .catch(() => { setGridDoc({}); setHorData(null); })
      .finally(() => setLoadGrid(false));
  };

  const docActual = docentes.find(d => String(d.id) === String(docId));

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
      <Card style={{ padding:'1rem 1.25rem' }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:8, color:'var(--text-primary)' }}>Selecciona un docente</div>
        <select value={docId} onChange={e => { setDocId(e.target.value); cargar(e.target.value); }}
          style={{ padding:'9px 13px', border:'1.5px solid var(--border)', borderRadius:'var(--radius)', fontSize:14, background:'#fff', cursor:'pointer', width:'100%', maxWidth:420, fontFamily:'inherit' }}>
          <option value="">— Seleccionar docente —</option>
          {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}{d.especialidad ? ` · ${d.especialidad}` : ''}</option>)}
        </select>
      </Card>

      {loadGrid ? (
        <Card style={{ padding:'2rem', textAlign:'center', color:'var(--text-secondary)' }}>Cargando agenda…</Card>
      ) : docId && Object.keys(gridDoc).length === 0 ? (
        <Card style={{ padding:'2.5rem', textAlign:'center', color:'var(--text-secondary)' }}>
          <div style={{ fontSize:36, marginBottom:10 }}>🧑‍🏫</div>
          <div style={{ fontWeight:600 }}>Sin horario asignado aún para {docActual?.nombre}</div>
        </Card>
      ) : docId ? (
        <Card style={{ padding:0, overflow:'hidden' }}>
          <HorarioGrid
            grid={gridDoc}
            bloques={horData?.bloques || BLOQUES_9}
            receso={horData?.receso   || RECESO_9}
            dias={horData?.dias       || DIAS_DEFAULT}
            modo="docente"
            titulo={docActual?.nombre}
            subtitulo={docActual?.especialidad || 'Docente'}
            estadisticas={horData?.estadisticas}
          />
        </Card>
      ) : (
        <Card style={{ padding:'3rem', textAlign:'center', color:'var(--text-secondary)' }}>
          <div style={{ fontSize:40, marginBottom:10 }}>🧑‍🏫</div>
          <div style={{ fontWeight:600 }}>Selecciona un docente para ver su agenda semanal</div>
        </Card>
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function DirectivoHorarios() {
  const [tab,     setTab]     = useState('grupos');
  const [grupos,  setGrupos]  = useState([]);
  const [docentes,setDocentes]= useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/grupos').catch(()=>({ data:{ grupos:[] } })),
      api.get('/personal', { params:{ rol:'DOCENTE' } }).catch(()=>({ data:{ personal:[] } })),
    ]).then(([rG, rP]) => {
      const g = Array.isArray(rG.data) ? rG.data : (rG.data?.grupos || []);
      setGrupos(g);
      setDocentes(rP.data?.personal || []);
    }).finally(() => setLoading(false));
  }, []);

  const tabBtn = (id, icon, label) => (
    <button key={id} onClick={() => setTab(id)} style={{
      padding:'8px 18px', borderRadius:'var(--radius)', fontSize:13, fontWeight:600,
      border:'none', cursor:'pointer', fontFamily:'inherit',
      background: tab===id ? 'var(--green-700)' : 'transparent',
      color:      tab===id ? '#fff' : 'var(--text-secondary)',
    }}>{icon} {label}</button>
  );

  if (loading) return (
    <div style={{ padding:'0 2rem 2rem' }}>
      <PageHeader title="Horarios" subtitle="Visión general de horarios" />
      <Card style={{ padding:'3rem', textAlign:'center', color:'var(--text-secondary)' }}>Cargando…</Card>
    </div>
  );

  return (
    <div style={{ padding:'0 2rem 2rem' }}>
      <PageHeader title="Horarios" subtitle="Consulta horarios por grupo o por docente" />

      <div style={{ display:'flex', gap:4, background:'#f3f4f6', borderRadius:'var(--radius-lg)', padding:4, width:'fit-content', marginBottom:'1.5rem' }}>
        {tabBtn('grupos',   '📋', 'Por Grupo')}
        {tabBtn('docentes', '🧑‍🏫', 'Por Docente')}
      </div>

      {tab === 'grupos'   && <TabGrupos  grupos={grupos}   />}
      {tab === 'docentes' && <TabDocentes docentes={docentes} />}
    </div>
  );
}
