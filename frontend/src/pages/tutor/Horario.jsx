// src/pages/tutor/Horario.jsx
import { useTutor }     from '../../context/TutorContext';
import Card             from '../../components/ui/Card';
import SelectorHijo     from '../../components/tutor/SelectorHijo';
import { HORAS_HORARIO, DIAS, HORARIO_MOCK, colorMat } from './_shared';

const thS = {
  padding: '12px 14px', textAlign: 'center', fontSize: 13, fontWeight: 700,
  color: 'var(--green-800)', background: 'var(--green-50)',
  borderBottom: '1.5px solid var(--border)', borderLeft: '1px solid var(--border)',
};

export default function TutorHorario() {
  const { hijoActual, loading, hijos } = useTutor();
  // TODO: reemplazar HORARIO_MOCK con useFetch(getHorarioHijo, [hijoActual?.id])
  const horario = HORARIO_MOCK;

  // Materias únicas para la leyenda
  const materiasUnicas = [...new Set(
    Object.values(horario).flatMap(d => Object.values(d).map(c => c.mat))
  )];

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <div style={{ padding: '1.5rem 0 1rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Horario Escolar</h1>
        {hijoActual && (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            {hijoActual.nombre} &nbsp;·&nbsp; Grupo {hijoActual.grupo}
          </p>
        )}
      </div>

      <SelectorHijo />

      {/* Sin hijos */}
      {!loading && hijos.length === 0 && (
        <Card style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
          <p style={{ fontWeight: 600 }}>Sin alumnos registrados</p>
          <p style={{ fontSize: 14, marginTop: 6 }}>Contacta a la secretaría para vincular a tus hijos.</p>
        </Card>
      )}

      {!loading && hijoActual && (
        <>
          {/* Header alumno */}
          <div style={{
            background: 'linear-gradient(135deg, var(--green-800) 0%, var(--green-600) 100%)',
            borderRadius: 'var(--radius-lg)', padding: '1rem 1.5rem', color: '#fff', marginBottom: '1.25rem',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 22 }}>👤</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{hijoActual.nombre}</div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>Grupo: {hijoActual.grupo}</div>
            </div>
          </div>

          <Card style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr style={{ background: 'var(--green-50)' }}>
                  <th style={{ ...thS, textAlign: 'left', borderLeft: 'none', width: 130 }}>Hora</th>
                  {DIAS.map(d => <th key={d} style={thS}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {HORAS_HORARIO.map(hora => {
                  if (hora.receso) return (
                    <tr key="rec">
                      <td colSpan={6} style={{
                        padding: '7px 14px', background: '#f3f4f6', textAlign: 'center',
                        fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
                        letterSpacing: '0.06em', borderTop: '1px solid var(--border)',
                        borderBottom: '1px solid var(--border)',
                      }}>
                        RECESO · 09:30 - 09:50
                      </td>
                    </tr>
                  );
                  return (
                    <tr key={hora.id}>
                      <td style={{ padding: '8px 14px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                        {hora.label}
                      </td>
                      {DIAS.map(dia => {
                        const c   = horario[dia]?.[hora.id];
                        const col = c ? colorMat(c.mat) : null;
                        return (
                          <td key={dia} style={{ padding: 6, borderBottom: '1px solid var(--border)', borderLeft: '1px solid var(--border)', verticalAlign: 'top', height: 66 }}>
                            {c && (
                              <div style={{ background: col.bg, border: `1.5px solid ${col.border}`, borderRadius: 'var(--radius)', padding: '7px 10px', height: '100%' }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: col.text }}>{c.mat}</div>
                                <div style={{ fontSize: 10, color: col.text, opacity: 0.65, marginTop: 2 }}>Salón {c.salon}</div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          {/* Leyenda */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {materiasUnicas.map(mat => {
              const col = colorMat(mat);
              return (
                <div key={mat} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: col.bg, border: `1.5px solid ${col.border}` }} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{mat}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
