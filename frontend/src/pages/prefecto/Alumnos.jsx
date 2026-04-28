import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader        from '../../components/layout/PageHeader';
import Card              from '../../components/ui/Card';
import Badge             from '../../components/ui/Badge';
import ModalCrearReporte from '../../components/reportes/ModalCrearReporte';
import { useFetch }      from '../../hooks/useFetch';
import { getAlumnos }    from '../../api/alumnos.api';
import { getGrupos }     from '../../api/grupos.api';
import { showToast }     from '../../components/ui/Toast';

function PtsBadge({ pts }) {
  const color = pts <= 45 ? { bg: '#fee2e2', fg: '#991b1b' }
              : pts <= 65 ? { bg: '#ffedd5', fg: '#c2410c' }
              : pts <= 79 ? { bg: '#fef3c7', fg: '#92400e' }
              :             { bg: '#dcfce7', fg: '#166534' };
  return (
    <span style={{ background: color.bg, color: color.fg, fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
      {pts} pts
    </span>
  );
}

export default function PrefectoAlumnos() {
  const navigate = useNavigate();
  const [q,           setQ]           = useState('');
  const [grupo,       setGrupo]       = useState('');
  const [modalAlumno, setModalAlumno] = useState(null);

  const { data, refetch } = useFetch(() => getAlumnos({ q, grupo, estado: 'Activo', limit: 100 }), [q, grupo]);
  const { data: gruposData } = useFetch(() => getGrupos(), []);

  const alumnos = data?.alumnos || [];
  const grupos  = gruposData?.grupos || [];

  const fs = {
    padding: '9px 12px', border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)', fontSize: 14, background: '#fff',
    appearance: 'none', outline: 'none', cursor: 'pointer',
  };
  const thS = {
    textAlign: 'left', padding: '10px 14px', fontSize: 13, fontWeight: 600,
    color: 'var(--green-800)', background: 'var(--green-50)', borderBottom: '1px solid var(--border)',
  };
  const tdS = { padding: '12px 14px', borderBottom: '1px solid var(--border)', fontSize: 14, verticalAlign: 'middle' };

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader
        title="Gestión de Alumnos"
        subtitle={`Total de alumnos activos: ${alumnos.length}`}
      />

      <ModalCrearReporte
        open={!!modalAlumno}
        onClose={() => setModalAlumno(null)}
        alumnoPreset={modalAlumno}
        onSuccess={() => {
          showToast('Reporte guardado');
          setModalAlumno(null);
          refetch();
        }}
      />

      {/* Filtros */}
      <Card style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }}>🔍</span>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar por nombre o matrícula..."
            style={{ ...fs, width: '100%', paddingLeft: 36 }}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <select value={grupo} onChange={e => setGrupo(e.target.value)} style={{ ...fs, paddingRight: 32 }}>
            <option value="">Todos los grupos</option>
            {grupos.map(g => <option key={g.id} value={g.nombre}>{g.nombre}</option>)}
          </select>
          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 12, color: 'var(--text-muted)' }}>▾</span>
        </div>
      </Card>

      {/* Tabla */}
      <Card style={{ padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Matrícula', 'Nombre Completo', 'Grupo', 'Puntos Conducta', 'Tutor', 'Acciones'].map(h =>
                  <th key={h} style={thS}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {alumnos.map(a => (
                <tr key={a.id}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ ...tdS, color: 'var(--text-secondary)', fontSize: 13 }}>{a.matricula}</td>
                  <td style={{ ...tdS, fontWeight: 500 }}>{a.nombreCompleto}</td>
                  <td style={tdS}><Badge variant="success">{a.grupo}</Badge></td>
                  <td style={tdS}><PtsBadge pts={a.puntosConducta} /></td>
                  <td style={{ ...tdS, color: 'var(--text-secondary)' }}>{a.tutor}</td>
                  <td style={tdS}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        title="Ver reportes"
                        onClick={() => navigate(`/prefecto/reportes?alumno=${a.id}&nombre=${encodeURIComponent(a.nombreCompleto)}`)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, color: 'var(--green-700)', padding: '3px 5px', borderRadius: 6 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--green-50)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>👁</button>
                      <button
                        title="Crear reporte"
                        onClick={() => setModalAlumno({ id: a.id, nombre: a.nombreCompleto, matricula: a.matricula, puntosConducta: a.puntosConducta })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, color: '#2563eb', padding: '3px 5px', borderRadius: 6 }}
                        onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>✏️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {alumnos.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No se encontraron alumnos.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)', borderTop: '1px solid var(--border)' }}>
          Mostrando {alumnos.length} de {data?.total || alumnos.length} alumnos
        </div>
      </Card>
    </div>
  );
}
