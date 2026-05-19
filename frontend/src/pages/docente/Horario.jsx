// src/pages/docente/Horario.jsx
// Muestra la agenda semanal del docente autenticado, filtrada por su Personal.id.
import { useState, useEffect } from 'react';
import PageHeader        from '../../components/layout/PageHeader';
import Card              from '../../components/ui/Card';
import ModalCrearReporte from '../../components/reportes/ModalCrearReporte';
import api               from '../../api/client';

// ─── Paleta de colores ────────────────────────────────────────────────────────
const MATERIA_COLOR = {
  'Matemáticas':  { bg:'#DBEAFE', border:'#93C5FD', text:'#1E40AF' },
  'Español':      { bg:'#FEE2E2', border:'#FCA5A5', text:'#991B1B' },
  'Ciencias I':   { bg:'#D1FAE5', border:'#6EE7B7', text:'#065F46' },
  'Ciencias II':  { bg:'#D1FAE5', border:'#6EE7B7', text:'#065F46' },
  'Ciencias III': { bg:'#D1FAE5', border:'#6EE7B7', text:'#065F46' },
  'Historia I':   { bg:'#FEF3C7', border:'#FCD34D', text:'#92400E' },
  'Historia II':  { bg:'#FEF3C7', border:'#FCD34D', text:'#92400E' },
  'Historia III': { bg:'#FEF3C7', border:'#FCD34D', text:'#92400E' },
  'Geografía':    { bg:'#FFEDD5', border:'#FDBA74', text:'#C2410C' },
  'Inglés I':     { bg:'#EDE9FE', border:'#C4B5FD', text:'#5B21B6' },
  'Inglés II':    { bg:'#EDE9FE', border:'#C4B5FD', text:'#5B21B6' },
  'Inglés III':   { bg:'#EDE9FE', border:'#C4B5FD', text:'#5B21B6' },
  'Artes':        { bg:'#FCE7F3', border:'#F9A8D4', text:'#9D174D' },
  'Educación Física': { bg:'#CCFBF1', border:'#5EEAD4', text:'#0F766E' },
  'Formación Cívica y Ética I':   { bg:'#E0E7FF', border:'#A5B4FC', text:'#3730A3' },
  'Formación Cívica y Ética II':  { bg:'#E0E7FF', border:'#A5B4FC', text:'#3730A3' },
  'Formación Cívica y Ética III': { bg:'#E0E7FF', border:'#A5B4FC', text:'#3730A3' },
};
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
  if (MATERIA_COLOR[mat]) return MATERIA_COLOR[mat];
  let h = 0; for (const c of mat) h = (h * 31 + c.charCodeAt(0)) % PALETTE.length;
  return PALETTE[h];
}
function colorGrupo(g) {
  if (!g) return PALETTE[0];
  let h = 0; for (const c of g) h = (h * 31 + c.charCodeAt(0)) % PALETTE.length;
  return PALETTE[h];
}

// ─── Estructura de bloques ────────────────────────────────────────────────────
const BLOQUES = [
  { n:1, label:'07:00 - 07:50' }, { n:2, label:'07:50 - 08:40' },
  { n:3, label:'08:40 - 09:30' }, { n:4, label:'10:00 - 10:50' },
  { n:5, label:'10:50 - 11:40' }, { n:6, label:'11:40 - 12:30' },
  { n:7, label:'12:30 - 13:20' }, { n:8, label:'13:20 - 14:10' },
  { n:9, label:'14:10 - 15:00' },
];
const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes'];
const DIA_LABEL = { LUNES:'Lunes', MARTES:'Martes', MIERCOLES:'Miércoles', JUEVES:'Jueves', VIERNES:'Viernes' };

// ─── Convertir horarios (array) a grid ───────────────────────────────────────
function toGrid(horarios) {
  const g = {};
  for (const h of (horarios || [])) {
    const dia  = DIA_LABEL[h.dia] || h.dia;
    const slot = h.numeroClase;
    if (!g[dia]) g[dia] = {};
    g[dia][slot] = {
      id:      h.id,
      materia: h.asignacion?.materia?.nombre || '—',
      grupo:   h.asignacion?.grupo?.nombre   || '—',
      salon:   h.salon || '—',
    };
  }
  return g;
}

// ─── Panel lateral al hacer clic en una clase ────────────────────────────────
function PanelClase({ celda, dia, bloque, onClose }) {
  const [reporteOpen, setReporteOpen] = useState(false);
  if (!celda) return null;
  const col = colorMat(celda.materia);
  return (
    <>
      <div onClick={() => !reporteOpen && onClose()}
        style={{ position:'fixed', inset:0, background:'rgba(17,24,39,.4)', zIndex:500, pointerEvents: reporteOpen?'none':'auto' }} />
      <div style={{ position:'fixed', top:0, right:0, bottom:0, width:'min(420px,94vw)', background:'#fff', zIndex:501, display:'flex', flexDirection:'column', boxShadow:'-8px 0 32px rgba(0,0,0,.18)' }}>
        {/* Cabecera */}
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', background:col.bg, flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
            <div>
              <div style={{ fontSize:16, fontWeight:800, color:col.text }}>{celda.materia}</div>
              <div style={{ fontSize:12, color:col.text, opacity:.75, marginTop:2 }}>
                {celda.grupo} · {dia} · {bloque.label} · Salón {celda.salon}
              </div>
            </div>
            <div style={{ display:'flex', gap:8, flexShrink:0 }}>
              <button onClick={() => setReporteOpen(true)} style={{ padding:'7px 14px', borderRadius:'var(--radius)', background:'var(--green-700)', color:'#fff', border:'none', cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'inherit' }}>
                📋 Reporte
              </button>
              <button onClick={onClose} style={{ width:30, height:30, borderRadius:'50%', border:'1.5px solid var(--border)', background:'#fff', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
            </div>
          </div>
        </div>
        {/* Cuerpo */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8, color:'var(--text-muted)', padding:'2rem' }}>
          <div style={{ fontSize:40 }}>👥</div>
          <div style={{ fontWeight:600, color:'var(--text-primary)' }}>Grupo {celda.grupo}</div>
          <div style={{ fontSize:12, textAlign:'center' }}>Lista de alumnos disponible en el módulo de Control Escolar</div>
        </div>
      </div>
      <ModalCrearReporte open={reporteOpen} onClose={() => setReporteOpen(false)} onSuccess={() => setReporteOpen(false)} />
    </>
  );
}

// ─── Tabla de horario del docente (coloreada por GRUPO) ──────────────────────
function TablaHorarioDocente({ grid, onCeldaClick }) {
  const thS = {
    padding:'9px 11px', textAlign:'center', fontSize:12, fontWeight:700,
    color:'var(--green-800)', background:'var(--green-50)',
    borderBottom:'1.5px solid var(--border)', borderLeft:'1px solid var(--border)',
    whiteSpace:'nowrap',
  };

  // Grupos únicos para leyenda (cada grupo = color distinto)
  const grupos = [...new Set(
    DIAS.flatMap(d => BLOQUES.map(b => grid[d]?.[b.n]?.grupo).filter(Boolean))
  )];

  return (
    <div>
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:660 }}>
          <thead>
            <tr>
              <th style={{ ...thS, textAlign:'left', borderLeft:'none', width:120 }}>Bloque</th>
              {DIAS.map(d => <th key={d} style={thS}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {BLOQUES.flatMap((bloque, i) => {
              const rows = [];
              if (i === 3) rows.push(
                <tr key="receso">
                  <td colSpan={6} style={{ padding:'5px 10px', background:'#f1f5f9', textAlign:'center', fontSize:10, fontWeight:700, color:'var(--text-muted)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', letterSpacing:'.07em' }}>
                    RECESO · 09:30 – 10:00
                  </td>
                </tr>
              );
              rows.push(
                <tr key={bloque.n}>
                  <td style={{ padding:'6px 10px', borderBottom:'1px solid var(--border)', background:'#fafafa', whiteSpace:'nowrap' }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'#1B7A3D' }}>Bloque {bloque.n}</div>
                    <div style={{ fontSize:9, color:'var(--text-muted)' }}>{bloque.label}</div>
                  </td>
                  {DIAS.map(dia => {
                    const c   = grid[dia]?.[bloque.n];
                    const col = c ? colorGrupo(c.grupo) : null;
                    return (
                      <td key={dia}
                        onClick={() => c && onCeldaClick && onCeldaClick(c, dia, bloque)}
                        style={{ padding:5, borderBottom:'1px solid var(--border)', borderLeft:'1px solid var(--border)', verticalAlign:'top', height:68, cursor: c ? 'pointer' : 'default' }}
                        onMouseEnter={e => { if(c) e.currentTarget.style.filter='brightness(.97)'; }}
                        onMouseLeave={e => { e.currentTarget.style.filter=''; }}
                      >
                        {c && col && (
                          <div style={{ background:col.bg, border:`1.5px solid ${col.border}`, borderRadius:'var(--radius)', padding:'6px 8px', height:'100%', overflow:'hidden' }}>
                            <div style={{ fontSize:12, fontWeight:700, color:col.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.materia}</div>
                            <div style={{ fontSize:11, fontWeight:700, color:col.text, opacity:.9, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.grupo}</div>
                            <div style={{ fontSize:10, color:col.text, opacity:.6, marginTop:1 }}>Salón {c.salon}</div>
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
      {grupos.length > 0 && (
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', padding:'8px 4px 0' }}>
          <span style={{ fontSize:11, color:'var(--text-muted)', alignSelf:'center' }}>Grupos:</span>
          {grupos.map(g => {
            const c = colorGrupo(g);
            return (
              <div key={g} style={{ display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ width:10, height:10, borderRadius:3, background:c.bg, border:`1.5px solid ${c.border}` }} />
                <span style={{ fontSize:11, color:'var(--text-secondary)' }}>{g}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function DocenteHorario() {
  const [grid,      setGrid]      = useState({});
  const [horarios,  setHorarios]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [sinDatos,  setSinDatos]  = useState(false);
  const [panel,     setPanel]     = useState(null); // { celda, dia, bloque }

  useEffect(() => {
    api.get('/horarios/mi-horario')
      .then(({ data }) => {
        const list = data.horarios || [];
        setHorarios(list);
        setGrid(toGrid(list));
        setSinDatos(list.length === 0);
      })
      .catch(() => setSinDatos(true))
      .finally(() => setLoading(false));
  }, []);

  // Estadísticas rápidas
  const grupos   = [...new Set(horarios.map(h => h.asignacion?.grupo?.nombre).filter(Boolean))];
  const materias = [...new Set(horarios.map(h => h.asignacion?.materia?.nombre).filter(Boolean))];
  const total    = horarios.length;

  if (loading) {
    return (
      <div style={{ padding:'0 2rem 2rem' }}>
        <PageHeader title="Mi Horario" subtitle="Ciclo 2025-2026" />
        <Card style={{ padding:'3rem', textAlign:'center', color:'var(--text-secondary)' }}>
          Cargando horario…
        </Card>
      </div>
    );
  }

  if (sinDatos) {
    return (
      <div style={{ padding:'0 2rem 2rem' }}>
        <PageHeader title="Mi Horario" subtitle="Ciclo 2025-2026" />
        <Card style={{ padding:'4rem', textAlign:'center' }}>
          <div style={{ fontSize:52, marginBottom:16 }}>📅</div>
          <div style={{ fontSize:17, fontWeight:700, marginBottom:8 }}>Aún no tienes horario asignado</div>
          <div style={{ fontSize:13, color:'var(--text-secondary)', maxWidth:420, margin:'0 auto', lineHeight:1.6 }}>
            El administrador importará el PDF de aSc Horarios. Una vez guardado, tu carga semanal aparecerá aquí automáticamente.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding:'0 2rem 2rem' }}>
      <PageHeader title="Mi Horario" subtitle="Ciclo 2025-2026" />

      {/* Estadísticas */}
      <div style={{ display:'flex', gap:'1rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        {[
          { valor: total,           etiqueta:'Clases / semana'    },
          { valor: grupos.length,   etiqueta:'Grupos asignados'   },
          { valor: `${total * 50} min`, etiqueta:'Horas semanales' },
          { valor: materias.join(', ') || '—', etiqueta:'Materias' },
        ].map(({ valor, etiqueta }) => (
          <Card key={etiqueta} style={{ padding:'0.9rem 1.4rem', flex:1, minWidth:130 }}>
            <div style={{ fontSize:18, fontWeight:800, color:'var(--green-800)' }}>{valor}</div>
            <div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:2 }}>{etiqueta}</div>
          </Card>
        ))}
      </div>

      <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:'0.75rem' }}>
        💡 Haz clic en cualquier clase para ver el grupo y crear reportes.
      </p>

      <Card style={{ padding:0, overflow:'hidden' }}>
        <div style={{ padding:'12px 18px', background:'var(--green-50)', borderBottom:'1.5px solid var(--border)' }}>
          <div style={{ fontSize:14, fontWeight:700, color:'var(--green-800)' }}>Horario semanal · color por grupo</div>
        </div>
        <div style={{ padding:'1rem' }}>
          <TablaHorarioDocente grid={grid} onCeldaClick={(c, d, b) => setPanel({ celda:c, dia:d, bloque:b })} />
        </div>
      </Card>

      {panel && (
        <PanelClase
          celda={panel.celda}
          dia={panel.dia}
          bloque={panel.bloque}
          onClose={() => setPanel(null)}
        />
      )}
    </div>
  );
}
