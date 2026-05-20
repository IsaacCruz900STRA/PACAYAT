// src/pages/docente/Dashboard.jsx
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Users, Calendar, AlertTriangle, BookOpen } from 'lucide-react';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import AvisosNuevosBanner from '../../components/avisos/AvisosNuevosBanner';
import { getPeriodoEvaluacionActivo } from '../../api/periodos.api';

const TIPOS_DOCENTE = ['PERIODO_EVALUACION', 'GENERAL'];

function fmtFecha(iso) {
  const d = new Date(iso);
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${d.getUTCDate()} de ${meses[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

const GRUPOS_MOCK = [
  { grupo: '1° A', materia: 'Matemáticas',  alumnos: 32, promedio: 8.2, idAsignacion: 1 },
  { grupo: '2° B', materia: 'Álgebra',      alumnos: 28, promedio: 7.8, idAsignacion: 2 },
  { grupo: '3° A', materia: 'Geometría',    alumnos: 30, promedio: 8.5, idAsignacion: 3 },
  { grupo: '3° C', materia: 'Geometría',    alumnos: 25, promedio: 7.5, idAsignacion: 4 },
];

const RIESGO_MOCK = [
  { nombre: 'Juan Pérez García',   grupo: '1° A', puntos: 58, faltas: 8,  promedio: 6.2 },
  { nombre: 'María López Ruiz',    grupo: '2° B', puntos: 45, faltas: 12, promedio: 5.5 },
  { nombre: 'Carlos Martínez',     grupo: '1° A', puntos: 68, faltas: 5,  promedio: 6.8 },
  { nombre: 'Ana Hernández',       grupo: '3° A', puntos: 55, faltas: 9,  promedio: 6.0 },
  { nombre: 'Roberto Sánchez',     grupo: '3° C', puntos: 72, faltas: 6,  promedio: 6.5 },
  { nombre: 'Laura Ramírez',       grupo: '3° C', puntos: 55, faltas: 7,  promedio: 6.3 },
  { nombre: 'Jorge Flores',        grupo: '2° B', puntos: 48, faltas: 10, promedio: 5.8 },
  { nombre: 'Miguel Díaz',         grupo: '3° C', puntos: 38, faltas: 15, promedio: 5.2 },
];

// ── Helpers ──────────────────────────────────────────────────────
function ptsBadge(pts) {
  const bg    = pts <= 45 ? '#fee2e2' : pts <= 65 ? '#ffedd5' : '#fef3c7';
  const color = pts <= 45 ? '#991b1b' : pts <= 65 ? '#c2410c' : '#92400e';
  return { bg, color };
}

function promedioColor(p) {
  if (p < 6)   return '#dc2626';
  if (p < 7.5) return '#d97706';
  return '#16a34a';
}

function avisoColors(tipo) {
  return tipo === 'danger'
    ? { border: '#ef4444', bg: '#fef2f2', icon: 'warning', titleColor: '#991b1b' }
    : { border: '#f59e0b', bg: '#fffbeb', icon: 'bell', titleColor: '#92400e' };
}

export default function DocenteDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [periodoEval, setPeriodoEval] = useState(null);

  useEffect(() => {
    getPeriodoEvaluacionActivo()
      .then(({ data }) => setPeriodoEval(data))
      .catch(() => {});
  }, []);

  const thStyle = {
    textAlign: 'left', padding: '10px 16px', fontSize: 13,
    fontWeight: 600, color: 'var(--green-800)',
    borderBottom: '1px solid var(--border)',
    background: 'var(--green-50)',
  };
  const tdStyle = {
    padding: '13px 16px', borderBottom: '1px solid var(--border)',
    fontSize: 14, verticalAlign: 'middle',
  };

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader
        title="Panel Docente"
        subtitle={user?.nombre || 'Docente'}
      />

      {/* Banner de avisos nuevos */}
      <AvisosNuevosBanner tiposPermitidos={TIPOS_DOCENTE} avisosPath="/docente/avisos" />

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Mis Grupos',          value: GRUPOS_MOCK.length,  icon: <Users size={22} />,        iconBg: '#dcfce7' },
          { label: 'Periodo Actual',       value: periodoEval?.nombre || '—', icon: <Calendar size={22} />,   iconBg: '#dbeafe', big: true },
          { label: 'Alumnos en Riesgo',    value: RIESGO_MOCK.length,  icon: <AlertTriangle size={22} />, iconBg: '#fee2e2' },
        ].map((s, i) => (
          <Card key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: s.big ? 26 : 32, fontWeight: 700, lineHeight: 1.2, whiteSpace: 'pre-line' }}>{s.value}</div>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {s.icon}
            </div>
          </Card>
        ))}
      </div>

      {/* ── Mis Grupos Este Periodo ── */}
      <Card style={{ padding: 0, marginBottom: '1.5rem' }}>
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Mis Grupos Este Periodo</h2>
          <Button variant="outline" icon={<Calendar size={14} />} onClick={() => navigate('/docente/horario')}>Ver Horario</Button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Grupo','Materia','Nº Alumnos','Promedio Grupal','Acciones'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GRUPOS_MOCK.map((g, i) => (
              <tr key={i}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <td style={tdStyle}><strong>{g.grupo}</strong></td>
                <td style={tdStyle}>{g.materia}</td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{g.alumnos}</td>
                <td style={tdStyle}>
                  <span style={{ color: promedioColor(g.promedio), fontWeight: 700, fontSize: 15 }}>{g.promedio.toFixed(1)}</span>
                </td>
                <td style={tdStyle}>
                  <Button variant="outline" icon={<BookOpen size={14} />}
                    onClick={() => navigate(`/docente/calificaciones?asignacion=${g.idAsignacion}`)}>
                    Calificaciones
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* ── Alumnos en Riesgo ── */}
      <Card style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Alumnos en Riesgo de Mis Grupos</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Nombre','Grupo','Puntos','Faltas','Promedio'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RIESGO_MOCK.map((a, i) => {
              const { bg, color } = ptsBadge(a.puntos);
              const fc = a.faltas >= 10 ? '#dc2626' : a.faltas >= 6 ? '#d97706' : 'var(--text-primary)';
              return (
                <tr key={i}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={tdStyle}>{a.nombre}</td>
                  <td style={tdStyle}>{a.grupo}</td>
                  <td style={tdStyle}>
                    <span style={{ background: bg, color, fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                      {a.puntos} pts
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: fc, fontWeight: 600 }}>{a.faltas}</td>
                  <td style={{ ...tdStyle, color: promedioColor(a.promedio), fontWeight: 700 }}>{a.promedio.toFixed(1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
