import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, User, AlertTriangle, TrendingUp, ClipboardList, TrendingDown } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card       from '../../components/ui/Card';
import { getAlumnos }  from '../../api/alumnos.api';
import { getReportes } from '../../api/reportes.api';
import { getPersonal } from '../../api/personal.api';
import { formatDateTime } from '../../utils/formatters';
import ModalCrearReporte from '../../components/reportes/ModalCrearReporte';

// ── Stat Card ─────────────────────────────────────────────
function StatCard({ icon, iconBg, value, label }) {
  return (
    <Card style={{ padding: '1.25rem' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: '0.75rem' }}>
        {icon}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
    </Card>
  );
}

// ── Puntos badge ──────────────────────────────────────────
function PtsBadge({ pts }) {
  const color = pts <= 45 ? { bg: '#fee2e2', fg: '#991b1b' }
              : pts <= 65 ? { bg: '#fef3c7', fg: '#92400e' }
              : { bg: '#dcfce7', fg: '#166534' };
  return (
    <span style={{ fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: color.bg, color: color.fg }}>
      {pts} pts
    </span>
  );
}

export default function AdminDashboard() {
  const [alumnos, setAlumnos] = useState([]);
  const [totalAlumnos, setTotalAlumnos] = useState(0);
  const [totalPersonal, setTotalPersonal] = useState('—');
  const [promedioConducta, setPromedioConducta] = useState('—');
  const [reportes, setReportes] = useState([]);
  const [totalReportes, setTotalReportes] = useState(0);
  const [modalReporteOpen, setModalReporteOpen] = useState(false);

  useEffect(() => {
    async function cargarDashboard() {
      try {
        const [menorPuntajeRes, alumnosRes, reportesRes, personalRes] = await Promise.all([
          getAlumnos({ limit: 5, estado: 'Activo', sort: 'puntaje' }),
          getAlumnos({ limit: 100, estado: 'Activo' }),
          getReportes({ limit: 30 }),
          getPersonal({ estado: 'Activo' }),
        ]);
        const alumnosActivos = alumnosRes.data?.alumnos || [];
        setAlumnos(menorPuntajeRes.data?.alumnos || []);
        setTotalAlumnos(alumnosRes.data?.total || 0);
        setTotalPersonal(personalRes.data?.total ?? '—');
        setPromedioConducta(
          alumnosActivos.length
            ? (alumnosActivos.reduce((sum, alumno) => sum + alumno.puntosConducta, 0) / alumnosActivos.length).toFixed(1)
            : '—'
        );
        setReportes(reportesRes.data?.reportes || []);
        setTotalReportes(reportesRes.data?.total || 0);
      } catch (err) {
        console.error(err);
      }
    }
    cargarDashboard();
  }, []);

  const menorPuntaje = alumnos;

  const stats = [
    { icon: <Users size={18} />, iconBg: '#dcfce7', value: totalAlumnos || alumnos.length, label: 'Alumnos Activos' },
    { icon: <User size={18} />, iconBg: '#dbeafe', value: totalPersonal, label: 'Personal Activo' },
    { icon: <AlertTriangle size={18} />, iconBg: '#fef3c7', value: totalReportes, label: 'Reportes del Mes' },
    { icon: <TrendingUp size={18} />, iconBg: '#ccfbf1', value: promedioConducta, label: 'Promedio Conducta' },
  ];

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader title="Inicio" subtitle="Panel de Administración · Gestión escolar PACAYAT" />

      {/* Botón centralizado Crear Reporte */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setModalReporteOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '14px 36px', borderRadius: 'var(--radius)',
            background: 'var(--green-700)', color: '#fff',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 16, fontWeight: 700,
            boxShadow: 'var(--shadow-md)',
            transition: 'all var(--transition)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#14532d'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--green-700)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <ClipboardList size={20} />
          Crear Reporte de Conducta
        </button>
      </div>

      {/* Banner reinscripción */}
      <div style={{
        background: '#fffbeb', borderLeft: '4px solid var(--yellow-500)',
        borderRadius: 'var(--radius)', padding: '12px 16px',
        display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: '1.5rem',
      }}>
        <AlertTriangle size={18} color="#92400e" />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#92400e' }}>Periodo de Reinscripción Activo</div>
          <div style={{ fontSize: 13, color: '#78350f', marginTop: 1 }}>Del 1 al 15 de Mayo, 2026. Recordatorio enviado a tutores.</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <ModalCrearReporte
        open={modalReporteOpen}
        onClose={() => setModalReporteOpen(false)}
        onSuccess={() => { setModalReporteOpen(false); }}
      />

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

        {/* Alumnos menor puntaje */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Alumnos con Menor Puntaje</h3>
            <Link to="/admin/alumnos" style={{ fontSize: 12, color: 'var(--green-700)', fontWeight: 500 }}>Ver todos →</Link>
          </div>
          {menorPuntaje.map(a => (
            <Link key={a.id} to={`/admin/alumnos/${a.id}`} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid var(--border)',
              color: 'inherit',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{a.nombreCompleto}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.grupo}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PtsBadge pts={a.puntosConducta} />
                <TrendingDown size={14} color="var(--red-500)" />
              </div>
            </Link>
          ))}
          {menorPuntaje.length === 0 && (
            <div style={{ padding: '1rem 0', color: 'var(--text-secondary)', fontSize: 14 }}>
              Sin alumnos para mostrar.
            </div>
          )}
        </Card>

        {/* Últimos reportes */}
        <Card>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: '1rem' }}>Últimos Reportes</h3>
          <div style={{ maxHeight: 340, overflowY: 'auto', paddingRight: 6 }}>
            {reportes.map((r) => {
              const esNegativo = r.tipo === 'NEGATIVO';
              const delta = r.puntosDespues - r.puntosAntes;
              return (
                <div key={r.id} style={{
                  borderLeft: `4px solid ${esNegativo ? 'var(--red-500)' : 'var(--green-500)'}`,
                  borderRadius: '0 var(--radius) var(--radius) 0',
                  background: esNegativo ? 'var(--red-50)' : 'var(--green-50)',
                  padding: '10px 12px', marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{r.alumno?.nombreCompleto || '—'}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                      background: esNegativo ? 'var(--red-500)' : 'var(--green-500)', color: '#fff',
                    }}>
                      {esNegativo ? 'Negativo' : 'Positivo'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.alumno?.matricula || '—'}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{r.descripcion}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDateTime(r.creadoEn)}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: delta < 0 ? 'var(--red-600)' : 'var(--green-700)' }}>
                      {delta > 0 ? '+' : ''}{delta} pts
                    </span>
                  </div>
                </div>
              );
            })}
            {reportes.length === 0 && (
              <div style={{ padding: '1rem 0', color: 'var(--text-secondary)', fontSize: 14 }}>
                Sin reportes para mostrar.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
