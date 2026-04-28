// src/pages/control-escolar/Calificaciones.jsx
import PageHeader from '../../components/layout/PageHeader';
import Card       from '../../components/ui/Card';

const PERIODOS = ['Periodo 1', 'Periodo 2', 'Periodo 3', 'Periodo 4', 'Periodo 5'];

const MATERIAS = [
  'Español', 'Matemáticas', 'Inglés', 'Ciencias', 'Historia',
  'Geografía', 'Formación Cívica', 'Ed. Física', 'Artes', 'Tecnología',
];

function makeCals(materia) {
  const s = materia.length;
  return [
    7 + (s % 3) * 0.5,
    6.5 + (s % 4) * 0.3,
    7 + (s % 2) * 0.8,
    6.8 + (s % 3) * 0.4,
    null,
  ];
}

function calColor(v) {
  if (v === null) return 'var(--text-muted)';
  if (v < 6)     return '#dc2626';
  if (v < 7.5)   return '#d97706';
  return '#16a34a';
}

const thS = {
  textAlign: 'center', padding: '10px 12px', fontSize: 12, fontWeight: 600,
  color: 'var(--green-800)', background: 'var(--green-50)',
  borderBottom: '1px solid var(--border)', borderLeft: '1px solid var(--border)',
};
const tdS = {
  padding: '10px 12px', borderBottom: '1px solid var(--border)',
  fontSize: 13, verticalAlign: 'middle',
};

export default function ControlEscolarCalificaciones() {
  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader
        title="Calificaciones"
        subtitle="Vista general por materia y periodo"
      />

      <div style={{
        marginBottom: '1.25rem', padding: '1rem 1.25rem',
        background: 'var(--blue-50)', border: '1px solid var(--blue-100)',
        borderRadius: 'var(--radius)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 16 }}>📅</span>
          <span style={{ fontWeight: 700, color: 'var(--blue-700)' }}>
            Periodo Actual: Periodo 3 (Activo) · Cierra 30 Abr 2026
          </span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--blue-600)' }}>
          Como Control Escolar puedes editar calificaciones de cualquier periodo.
          Los docentes solo pueden capturar en el periodo activo.
        </p>
      </div>

      <Card style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ ...thS, textAlign: 'left', borderLeft: 'none', minWidth: 160 }}>
                Materia
              </th>
              {PERIODOS.map(p => (
                <th key={p} style={{ ...thS, minWidth: 90 }}>{p}</th>
              ))}
              <th style={{ ...thS, minWidth: 90 }}>Promedio</th>
            </tr>
          </thead>
          <tbody>
            {MATERIAS.map(mat => {
              const cals = makeCals(mat);
              const vals = cals.filter(v => v !== null);
              const prom = vals.length
                ? vals.reduce((a, b) => a + b, 0) / vals.length
                : null;

              return (
                <tr key={mat}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ ...tdS, fontWeight: 500 }}>{mat}</td>
                  {cals.map((v, i) => (
                    <td key={i} style={{ ...tdS, textAlign: 'center' }}>
                      {v !== null
                        ? <span style={{ color: calColor(v), fontWeight: 700 }}>{v.toFixed(1)}</span>
                        : <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Pendiente</span>}
                    </td>
                  ))}
                  <td style={{ ...tdS, textAlign: 'center' }}>
                    {prom !== null
                      ? <span style={{ color: calColor(prom), fontWeight: 700, fontSize: 15 }}>
                          {prom.toFixed(1)}
                        </span>
                      : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}