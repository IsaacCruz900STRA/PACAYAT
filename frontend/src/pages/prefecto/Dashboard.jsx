// src/pages/prefecto/Dashboard.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth }     from '../../context/AuthContext';
import Card            from '../../components/ui/Card';
import Button          from '../../components/ui/Button';
import PageHeader      from '../../components/layout/PageHeader';
import ModalCrearReporte from '../../components/reportes/ModalCrearReporte';
import AvisosNuevosBanner from '../../components/avisos/AvisosNuevosBanner';
import { useState }    from 'react';

const TIPOS_PREFECTO = ['CONDUCTA', 'GENERAL'];

// ── Helpers ─────────────────────────────────────────────────────
function ptsBadge(pts) {
  if (pts <= 45) return { bg: '#fee2e2', color: '#991b1b' };
  if (pts <= 65) return { bg: '#ffedd5', color: '#c2410c' };
  return { bg: '#dcfce7', color: '#166534' };
}
function tipoStyle(tipo) {
  return tipo === 'Negativo'
    ? { bg: '#fee2e2', color: '#991b1b' }
    : { bg: '#dcfce7', color: '#166534' };
}

// ── Mock data ───────────────────────────────────────────────────
const STATS = [
  { label: 'Reportes Hoy',        value: 12, icon: '📄', iconBg: '#dbeafe' },
  { label: 'Reportes Esta Semana',value: 47, icon: '📉', iconBg: '#fef3c7' },
  { label: 'Alumnos en Riesgo',   value: 23, icon: '⚠️', iconBg: '#fee2e2' },
];

const REPORTES_RECIENTES = [
  { fecha:'Hoy, 10:30 AM', alumno:'Juan Pérez García',   grupo:'1° A', tipo:'Negativo', gravedad:'Medio (-5 pts)',     desc:'Llegó tarde sin justificante',        por:'Luis Ramírez (Prefecto)' },
  { fecha:'Hoy, 9:45 AM',  alumno:'María López Ruiz',    grupo:'2° B', tipo:'Negativo', gravedad:'Grave (-10 pts)',     desc:'Falta de respeto al docente',         por:'Luis Ramírez (Prefecto)' },
  { fecha:'Ayer, 2:15 PM', alumno:'Carlos Martínez',     grupo:'1° A', tipo:'Negativo', gravedad:'No grave (-2 pts)',   desc:'No portaba uniforme completo',        por:'Patricia Morales (Prefecto)' },
  { fecha:'Ayer, 11:00 AM',alumno:'Elena Torres Vargas', grupo:'1° A', tipo:'Positivo', gravedad:'Muy positivo (+6 pts)',desc:'Ayudó a organizar evento cívico',    por:'Luis Ramírez (Prefecto)' },
  { fecha:'Ayer, 9:30 AM', alumno:'Roberto Sánchez',     grupo:'2° A', tipo:'Negativo', gravedad:'Medio (-5 pts)',      desc:'Ausencia injustificada',              por:'Patricia Morales (Prefecto)' },
];

const RIESGO = [
  { nombre:'Miguel Díaz Rodríguez', grupo:'3° C', pts:38, reportes:8,  ultimo:'Ayer'        },
  { nombre:'María López Ruiz',      grupo:'2° B', pts:45, reportes:6,  ultimo:'Hoy'         },
  { nombre:'Jorge Flores Morales',  grupo:'1° C', pts:48, reportes:5,  ultimo:'Hace 2 días' },
  { nombre:'Ana Hernández Santos',  grupo:'1° B', pts:52, reportes:4,  ultimo:'Hace 3 días' },
  { nombre:'Laura Ramírez Cruz',    grupo:'3° B', pts:55, reportes:5,  ultimo:'Hace 1 semana'},
  { nombre:'Juan Pérez García',     grupo:'1° A', pts:58, reportes:4,  ultimo:'Hoy'         },
];

const thS = {
  textAlign:'left', padding:'10px 16px', fontSize:13, fontWeight:600,
  color:'var(--green-800)', background:'var(--green-50)', borderBottom:'1px solid var(--border)',
};
const tdS = { padding:'12px 16px', borderBottom:'1px solid var(--border)', fontSize:14, verticalAlign:'middle' };

export default function PrefectoDashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [modal, setModal] = useState(false);

  return (
    <div style={{ padding:'0 2rem 2rem' }}>
      <PageHeader
        title="Panel de Prefectura"
        subtitle={user?.nombre || 'Prefecto'}
      />

      {/* Banner de avisos nuevos */}
      <AvisosNuevosBanner tiposPermitidos={TIPOS_PREFECTO} avisosPath="/prefecto/avisos" />

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
        {STATS.map(s => (
          <Card key={s.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.25rem' }}>
            <div>
              <div style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:32, fontWeight:700 }}>{s.value}</div>
            </div>
            <div style={{ width:48, height:48, borderRadius:'50%', background:s.iconBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
              {s.icon}
            </div>
          </Card>
        ))}
      </div>

      {/* Últimos reportes */}
      <Card style={{ padding:0, marginBottom:'1.5rem' }}>
        <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--border)' }}>
          <h2 style={{ fontSize:16, fontWeight:700 }}>Últimos Reportes Generados</h2>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>{['Fecha','Alumno','Grupo','Tipo','Gravedad','Descripción','Generado por'].map(h =>
                <th key={h} style={thS}>{h}</th>
              )}</tr>
            </thead>
            <tbody>
              {REPORTES_RECIENTES.map((r,i) => {
                const ts = tipoStyle(r.tipo);
                return (
                  <tr key={i}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <td style={{ ...tdS, whiteSpace:'nowrap', color:'var(--text-secondary)', fontSize:13 }}>{r.fecha}</td>
                    <td style={{ ...tdS, fontWeight:500 }}>{r.alumno}</td>
                    <td style={tdS}>{r.grupo}</td>
                    <td style={tdS}>
                      <span style={{ background:ts.bg, color:ts.color, fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>{r.tipo}</span>
                    </td>
                    <td style={{ ...tdS, fontSize:13, color:'var(--text-secondary)' }}>{r.gravedad}</td>
                    <td style={{ ...tdS, maxWidth:180 }}>{r.desc}</td>
                    <td style={{ ...tdS, fontSize:13, color:'var(--text-secondary)' }}>{r.por}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Alumnos en riesgo */}
      <Card style={{ padding:0 }}>
        <div style={{ padding:'1.25rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid var(--border)' }}>
          <h2 style={{ fontSize:16, fontWeight:700 }}>Alumnos en Riesgo <span style={{ color:'var(--text-secondary)', fontWeight:400 }}>(Menos de 60 puntos)</span></h2>
          <Button variant="outline" onClick={() => navigate('/prefecto/alumnos')}>Ver todos</Button>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr>{['Nombre','Grupo','Puntos','# Reportes','Último Reporte'].map(h =>
              <th key={h} style={thS}>{h}</th>
            )}</tr>
          </thead>
          <tbody>
            {RIESGO.map((a,i) => {
              const { bg, color } = ptsBadge(a.pts);
              return (
                <tr key={i}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
                  onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <td style={{ ...tdS, fontWeight:500 }}>{a.nombre}</td>
                  <td style={tdS}>{a.grupo}</td>
                  <td style={tdS}>
                    <span style={{ background:bg, color, fontSize:13, fontWeight:700, padding:'4px 12px', borderRadius:20 }}>{a.pts} pts</span>
                  </td>
                  <td style={{ ...tdS, fontWeight:600 }}>{a.reportes}</td>
                  <td style={{ ...tdS, color:'var(--text-secondary)' }}>{a.ultimo}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Modal global reporte — solo desde módulo Alumnos */}
      <ModalCrearReporte open={modal} onClose={() => setModal(false)} />
    </div>
  );
}
