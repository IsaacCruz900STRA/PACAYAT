// src/pages/secretaria/Dashboard.jsx — Inicio con estadísticas reales
import { useState, useEffect } from 'react';
import { useNavigate }  from 'react-router-dom';
import { Users, CheckCircle, XCircle, Building2, User, Bell, ClipboardList, BarChart2, TrendingUp } from 'lucide-react';
import { useAuth }      from '../../context/AuthContext';
import Card             from '../../components/ui/Card';
import PageHeader       from '../../components/layout/PageHeader';
import { getAlumnos }   from '../../api/alumnos.api';
import { getGrupos }    from '../../api/grupos.api';
import api              from '../../api/client';

const ACCESOS = [
  { icon: <User size={20} />, iconBg: '#dcfce7', label: 'Nuevo Alumno',      desc: 'Registrar un nuevo alumno',    action: '/secretaria/alumnos'   },
  { icon: <Building2 size={20} />, iconBg: '#ede9fe', label: 'Ver Grupos',   desc: 'Consultar alumnos por grupo',  action: '/secretaria/grupos'    },
  { icon: <Bell size={20} />, iconBg: '#fef3c7', label: 'Crear Aviso',       desc: 'Publicar un aviso general',    action: '/secretaria/avisos'    },
  { icon: <ClipboardList size={20} />, iconBg: '#fce7f3', label: 'Nuevo Reporte', desc: 'Registrar reporte de conducta', action: '/secretaria/reportes' },
];

function StatCard({ label, value, icon, iconBg, color }) {
  return (
    <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem' }}>
      <div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: color || 'var(--text-primary)' }}>{value}</div>
      </div>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
    </Card>
  );
}

export default function SecretariaDashboard() {
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [stats, setStats] = useState({ alumnos: 0, activos: 0, inactivos: 0, grupos: 0, personal: 0 });
  const [distribucion, setDistribucion] = useState([]); // grupos con conteo
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAlumnos({ limit: 1 }),
      getAlumnos({ estado: 'Activo',   limit: 1 }),
      getAlumnos({ estado: 'Inactivo', limit: 1 }),
      getGrupos(),
      api.get('/personal', { params: { limit: 1 } }),
    ]).then(([todos, activos, inactivos, grps, pers]) => {
      const grupos = grps.data?.grupos || [];
      setStats({
        alumnos:   todos.data?.total    || 0,
        activos:   activos.data?.total  || 0,
        inactivos: inactivos.data?.total|| 0,
        grupos:    grupos.length,
        personal:  pers.data?.total || (pers.data?.personal?.length) || 0,
      });

      // Distribución por grado
      const porGrado = {};
      grupos.forEach(g => {
        const k = `${g.grado}° Grado`;
        porGrado[k] = (porGrado[k] || 0) + 1;
      });
      setDistribucion(Object.entries(porGrado).sort());
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader
        title="Inicio"
        subtitle={`Bienvenida, ${user?.nombre || 'Secretaría'}`}
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="Alumnos inscritos"  value={loading ? '…' : stats.alumnos}   icon={<Users size={22} />}        iconBg="#dcfce7" />
        <StatCard label="Alumnos activos"    value={loading ? '…' : stats.activos}   icon={<CheckCircle size={22} />}  iconBg="#d1fae5" color="#16a34a" />
        <StatCard label="Alumnos inactivos"  value={loading ? '…' : stats.inactivos} icon={<XCircle size={22} />}      iconBg="#fee2e2" color="#dc2626" />
        <StatCard label="Grupos registrados" value={loading ? '…' : stats.grupos}    icon={<Building2 size={22} />}    iconBg="#ede9fe" />
      </div>

      {/* Accesos rápidos */}
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: '1rem' }}>Accesos Rápidos</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {ACCESOS.map(a => (
          <Card key={a.label}
            style={{ padding: '1.25rem', cursor: 'pointer', transition: 'box-shadow var(--transition)' }}
            onClick={() => navigate(a.action)}
            onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)', background: a.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
              {a.icon}
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{a.label}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{a.desc}</div>
          </Card>
        ))}
      </div>

      {/* Gráfica de distribución por grado */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <Card style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: '1rem', color: 'var(--green-800)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <BarChart2 size={15} /> Distribución por Grado
          </h3>
          {loading ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Cargando...</div>
          ) : distribucion.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Sin grupos registrados</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {distribucion.map(([grado, count]) => {
                const pct = stats.grupos > 0 ? Math.round((count / stats.grupos) * 100) : 0;
                return (
                  <div key={grado}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{grado}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{count} grupo{count > 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ height: 8, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--green-600)', borderRadius: 99, transition: 'width .5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: '1rem', color: 'var(--green-800)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={15} /> Resumen del Ciclo
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Total de alumnos inscritos', value: stats.alumnos,   icon: <Users size={16} />,        color: 'var(--text-primary)' },
              { label: 'Alumnos activos',            value: stats.activos,   icon: <CheckCircle size={16} />,  color: '#16a34a' },
              { label: 'Alumnos inactivos',          value: stats.inactivos, icon: <XCircle size={16} />,      color: '#dc2626' },
              { label: 'Grupos en el ciclo',         value: stats.grupos,    icon: <Building2 size={16} />,    color: '#7c3aed' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{item.label}</span>
                </div>
                <span style={{ fontSize: 18, fontWeight: 700, color: item.color }}>
                  {loading ? '…' : item.value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
