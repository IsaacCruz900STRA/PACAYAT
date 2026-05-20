// src/pages/prefecto/Horarios.jsx
// Vista: todos los grupos/grados. El prefecto selecciona grado → grupo → ve el horario.
import { useState, useEffect } from 'react';
import { ClipboardList, Calendar } from 'lucide-react';
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

export default function PrefectoHorarios() {
  const [grupos,   setGrupos]   = useState([]);
  const [grado,    setGrado]    = useState('1');
  const [grupoId,  setGrupoId]  = useState(null);
  const [grid,     setGrid]     = useState({});
  const [loading,  setLoading]  = useState(true);
  const [loadGrid, setLoadGrid] = useState(false);
  const [sinDatos, setSinDatos] = useState(false);

  useEffect(() => {
    api.get('/grupos')
      .then(({ data }) => {
        const g = Array.isArray(data) ? data : (data?.grupos || []);
        setGrupos(g);
      })
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) return (
    <div style={{ padding:'0 2rem 2rem' }}>
      <PageHeader title="Horarios" subtitle="Consulta de horarios por grupo" />
      <Card style={{ padding:'3rem', textAlign:'center', color:'var(--text-secondary)' }}>Cargando…</Card>
    </div>
  );

  return (
    <div style={{ padding:'0 2rem 2rem' }}>
      <PageHeader title="Horarios" subtitle="Consulta el horario de cualquier grupo" />

      <Card style={{ padding:'1rem 1.25rem', marginBottom:'1rem' }}>
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
          <div style={{ fontSize:40, marginBottom:12, display:'flex', justifyContent:'center' }}><ClipboardList size={40} /></div>
          <div style={{ fontWeight:600, marginBottom:6 }}>Sin horario para {grupoActual?.nombre}</div>
          <div style={{ fontSize:13, color:'var(--text-secondary)' }}>El administrador aún no ha importado el horario de este grupo.</div>
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
          <div style={{ fontSize:40, marginBottom:12, display:'flex', justifyContent:'center' }}><Calendar size={40} /></div>
          <div style={{ fontWeight:600 }}>Selecciona un grupo para ver su horario</div>
        </Card>
      )}
    </div>
  );
}
