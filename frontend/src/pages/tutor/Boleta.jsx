// src/pages/tutor/Boleta.jsx
import { useTutor }   from '../../context/TutorContext';
import Card           from '../../components/ui/Card';
import SelectorHijo   from '../../components/tutor/SelectorHijo';
import { PERIODOS, MATERIAS_MOCK, calColor } from './_shared';

function promedio(cals) {
  const vals = cals.filter(v => v !== null && v !== undefined);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

const thS = {
  padding: '10px 14px', textAlign: 'center', fontSize: 13, fontWeight: 600,
  color: 'var(--green-800)', background: 'var(--green-50)',
  borderBottom: '1px solid var(--border)', borderLeft: '1px solid var(--border)',
};
const tdS = { padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 14, verticalAlign: 'middle' };

// Tabla vacía — cuando no hay hijo seleccionado
function TablaVacia({ tipo }) {
  return (
    <Card style={{ padding: 0 }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>
          {tipo === 'cal' ? 'Calificaciones por Materia' : 'Faltas por Materia'}
        </h3>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...thS, textAlign: 'left', borderLeft: 'none', minWidth: 160 }}>Materia</th>
            {PERIODOS.map(p => <th key={p} style={{ ...thS, minWidth: 90 }}>{p}</th>)}
            <th style={{ ...thS, minWidth: 90 }}>{tipo === 'cal' ? 'Promedio' : 'Total'}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={PERIODOS.length + 2} style={{ ...tdS, textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
              Selecciona un alumno para ver sus {tipo === 'cal' ? 'calificaciones' : 'faltas'}.
            </td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}

export default function TutorBoleta() {
  const { hijoActual, loading, hijos } = useTutor();
  // TODO: reemplazar con useFetch(getBoletaHijo, [hijoActual?.id])
  const materias = MATERIAS_MOCK;

  const promedioGeneral = (() => {
    const proms = materias.map(m => promedio(m.cals)).filter(v => v !== null);
    if (!proms.length) return null;
    return proms.reduce((a, b) => a + b, 0) / proms.length;
  })();

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <div style={{ padding: '1.5rem 0 1rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Boleta Digital</h1>
        {hijoActual && (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            {hijoActual.nombre} &nbsp;·&nbsp; Grupo {hijoActual.grupo}
          </p>
        )}
      </div>

      <SelectorHijo />

      {/* Sin hijos */}
      {!loading && hijos.length === 0 && (
        <>
          <TablaVacia tipo="cal" />
          <div style={{ marginTop: '1.25rem' }}><TablaVacia tipo="fal" /></div>
        </>
      )}

      {!loading && hijoActual && (
        <>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--green-800) 0%, var(--green-600) 100%)',
            borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', color: '#fff', marginBottom: '1.25rem',
          }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Calificaciones</div>
            <div style={{ fontSize: 14, opacity: 0.85, marginTop: 2 }}>{hijoActual.nombre} · {hijoActual.grupo}</div>
          </div>

          {/* Info periodo */}
          <Card style={{ background: 'var(--blue-50)', border: '1px solid var(--blue-100)', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>📅</span>
              <span style={{ fontWeight: 700, color: 'var(--blue-600)' }}>Periodo Actual</span>
            </div>
            {[
              { label: 'Periodo 4:', val: 'Marzo - Abril 2026 (Activo)', color: 'var(--blue-600)' },
              { label: 'Periodo 5:', val: 'Mayo - Junio 2026 (Próximo)', color: 'var(--text-secondary)' },
            ].map(p => (
              <div key={p.label} style={{ fontSize: 14, color: p.color, marginBottom: 2 }}>
                <strong>{p.label}</strong> {p.val}
              </div>
            ))}
          </Card>

          {/* Promedio general */}
          {promedioGeneral && (
            <Card style={{ marginBottom: '1.25rem', padding: '1.5rem', textAlign: 'center', border: `2px solid ${calColor(promedioGeneral)}22` }}>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 6 }}>Promedio General del Ciclo</div>
              <div style={{ fontSize: 52, fontWeight: 700, color: calColor(promedioGeneral) }}>{promedioGeneral.toFixed(1)}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                {promedioGeneral >= 8 ? 'Buen desempeño' : promedioGeneral >= 7 ? 'Desempeño regular' : 'Necesita mejorar'}
              </div>
            </Card>
          )}

          {/* Tabla calificaciones */}
          <Card style={{ padding: 0, marginBottom: '1.25rem' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Calificaciones por Materia</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ ...thS, textAlign: 'left', borderLeft: 'none', minWidth: 160 }}>Materia</th>
                    {PERIODOS.map(p => <th key={p} style={{ ...thS, minWidth: 90 }}>{p}</th>)}
                    <th style={{ ...thS, minWidth: 90 }}>Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {materias.map(m => {
                    const prom = promedio(m.cals);
                    return (
                      <tr key={m.materia}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td style={{ ...tdS, fontWeight: 500 }}>{m.materia}</td>
                        {m.cals.map((v, i) => (
                          <td key={i} style={{ ...tdS, textAlign: 'center' }}>
                            {v !== null
                              ? <span style={{ color: calColor(v), fontWeight: 700 }}>{v.toFixed(1)}</span>
                              : <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Pendiente</span>}
                          </td>
                        ))}
                        <td style={{ ...tdS, textAlign: 'center' }}>
                          {prom !== null
                            ? <span style={{ color: calColor(prom), fontWeight: 700, fontSize: 15 }}>{prom.toFixed(1)}</span>
                            : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Tabla faltas */}
          <Card style={{ padding: 0 }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Faltas por Materia</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ ...thS, textAlign: 'left', borderLeft: 'none', minWidth: 160 }}>Materia</th>
                    {PERIODOS.map(p => <th key={p} style={{ ...thS, minWidth: 90 }}>{p}</th>)}
                    <th style={{ ...thS, minWidth: 90 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {materias.map(m => {
                    const total = m.faltas.reduce((a, b) => a + b, 0);
                    return (
                      <tr key={m.materia}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td style={{ ...tdS, fontWeight: 500 }}>{m.materia}</td>
                        {m.faltas.map((v, i) => (
                          <td key={i} style={{ ...tdS, textAlign: 'center' }}>
                            <span style={{ color: v > 0 ? '#dc2626' : 'var(--text-secondary)', fontWeight: v > 0 ? 700 : 400 }}>
                              {v > 0 ? v : '—'}
                            </span>
                          </td>
                        ))}
                        <td style={{ ...tdS, textAlign: 'center', fontWeight: 700, color: total > 3 ? '#dc2626' : total > 0 ? '#d97706' : 'var(--green-700)' }}>
                          {total}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
