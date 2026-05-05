// src/pages/directivo/Dashboard.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth }     from '../../context/AuthContext';
import Card            from '../../components/ui/Card';
import Button          from '../../components/ui/Button';
import PageHeader      from '../../components/layout/PageHeader';
import { ALUMNOS_MOCK, REPORTES_MOCK, ptsBadgeStyle } from './_mockData';

const promedioEscuela = (ALUMNOS_MOCK.reduce((s,a) => s + a.puntos, 0) / ALUMNOS_MOCK.length).toFixed(1);
const enRiesgo        = ALUMNOS_MOCK.filter(a => a.puntos < 60).length;
const MENOR_PUNTAJE   = [...ALUMNOS_MOCK].sort((a,b) => a.puntos - b.puntos).slice(0, 5);
const ULTIMOS_REPORTES = REPORTES_MOCK.slice(0, 4);

export default function DirectivoDashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader title="Panel Directivo" subtitle={user?.nombre} />

      {/* Banner periodo */}
      <div style={{
        background: '#fffbeb', borderLeft: '4px solid var(--yellow-500)',
        borderRadius: 'var(--radius)', padding: '12px 16px',
        display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: '1.5rem',
      }}>
        <span style={{ fontSize: 18 }}>⚠️</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#92400e' }}>Periodo de Reinscripción Activo</div>
          <div style={{ fontSize: 13, color: '#78350f', marginTop: 1 }}>Del 1 al 15 de Mayo, 2026. Recordatorio enviado a tutores.</div>
        </div>
      </div>

      {/* Stats — sin "Reportes del Mes", promedio de conducta → promedio de escuela */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Alumnos Activos',   value: ALUMNOS_MOCK.length, icon: '👥', iconBg: '#dcfce7' },
          { label: 'Personal Activo',   value: 9,                   icon: '👤', iconBg: '#dbeafe' },
          { label: 'Promedio Escuela',  value: promedioEscuela,     icon: '📊', iconBg: '#ccfbf1' },
        ].map(s => (
          <Card key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 32, fontWeight: 700 }}>{s.value}</div>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              {s.icon}
            </div>
          </Card>
        ))}
      </div>

      {/* Dos columnas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

        {/* Alumnos con menor puntaje */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Alumnos con Menor Puntaje</h3>
            <button onClick={() => navigate('/directivo/alumnos')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green-700)', fontSize: 13, fontWeight: 500, fontFamily: 'inherit' }}>
              Ver todos →
            </button>
          </div>
          {MENOR_PUNTAJE.map(a => {
            const { bg, color } = ptsBadgeStyle(a.puntos);
            return (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{a.nombre}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.grupo}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: bg, color, fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{a.puntos} pts</span>
                  <span style={{ color: 'var(--red-500)', fontSize: 14 }}>↘</span>
                </div>
              </div>
            );
          })}
        </Card>

        {/* Últimos reportes */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Últimos Reportes</h3>
            <button onClick={() => navigate('/directivo/reportes')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green-700)', fontSize: 13, fontWeight: 500, fontFamily: 'inherit' }}>
              Ver todos →
            </button>
          </div>
          {ULTIMOS_REPORTES.map((r, i) => {
            const isNeg = r.tipo === 'Negativo';
            return (
              <div key={i} style={{
                borderLeft: `4px solid ${isNeg ? '#ef4444' : '#22c55e'}`,
                background: isNeg ? '#fef2f2' : '#f0fdf4',
                borderRadius: '0 var(--radius) var(--radius) 0',
                padding: '10px 12px', marginBottom: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{r.alumno}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: isNeg ? '#ef4444' : '#22c55e', color: '#fff' }}>
                    {r.tipo}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.grupo}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{r.desc}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.fecha}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: r.delta < 0 ? '#dc2626' : '#16a34a' }}>
                    {r.delta > 0 ? '+' : ''}{r.delta} pts
                  </span>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
