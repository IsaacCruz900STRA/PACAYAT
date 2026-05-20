// src/pages/tutor/Boleta.jsx
import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useTutor }          from '../../context/TutorContext';
import Card                  from '../../components/ui/Card';
import SelectorHijo          from '../../components/tutor/SelectorHijo';
import { calColor }          from './_shared';
import { getCalificaciones } from '../../api/calificaciones.api';
import { getAsistencia }     from '../../api/asistencia.api';
import { getPeriodos }       from '../../api/periodos.api';

function promedio(cals) {
  const vals = cals.filter(v => v !== null && v !== undefined);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function fmtFecha(iso) {
  return new Date(iso).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
}

const thS = {
  padding: '10px 14px', textAlign: 'center', fontSize: 13, fontWeight: 600,
  color: 'var(--green-800)', background: 'var(--green-50)',
  borderBottom: '1px solid var(--border)', borderLeft: '1px solid var(--border)',
};
const tdS = { padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 14, verticalAlign: 'middle' };

function TablaVacia({ tipo }) {
  return (
    <Card style={{ padding: 0 }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>
          {tipo === 'cal' ? 'Calificaciones por Materia' : 'Faltas por Materia'}
        </h3>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td colSpan={8} style={{ ...tdS, textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
              Selecciona un alumno para ver sus {tipo === 'cal' ? 'calificaciones' : 'faltas'}.
            </td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}

export default function TutorBoleta() {
  const { hijoActual, loading: loadingTutor, hijos } = useTutor();
  const [periodos, setPeriodos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (!hijoActual?.id) { setMaterias([]); setPeriodos([]); return; }
    setLoading(true);

    const asistenciaPromise = hijoActual.idInscripcion
      ? getAsistencia({ idInscripcion: hijoActual.idInscripcion })
      : Promise.resolve({ data: { asistencias: [] } });

    Promise.all([
      getCalificaciones({ idAlumno: hijoActual.id }),
      asistenciaPromise,
      getPeriodos(),
    ])
      .then(([calRes, asRes, perRes]) => {
        const cals    = calRes.data.calificaciones || [];
        const asis    = asRes.data.asistencias     || [];
        const perList = perRes.data.periodos       || [];
        setPeriodos(perList);

        // Pivot calificaciones: { materia: { periodoNombre: valor } }
        const calMap = {};
        for (const c of cals) {
          if (!calMap[c.materia]) calMap[c.materia] = {};
          calMap[c.materia][c.periodo] = c.calificacion;
        }

        // Pivot faltas por periodo (usando fecha vs rango del periodo)
        const faltasMap = {};
        for (const a of asis) {
          if (a.estado !== 'FALTA') continue;
          const mat = a.asignacion?.materia?.nombre;
          const d   = new Date(a.fecha);
          const per = perList.find(p => d >= new Date(p.fechaInicio) && d <= new Date(p.fechaFin));
          if (!mat || !per) continue;
          if (!faltasMap[mat]) faltasMap[mat] = {};
          faltasMap[mat][per.nombre] = (faltasMap[mat][per.nombre] || 0) + 1;
        }

        const allMats = [...new Set([...Object.keys(calMap), ...Object.keys(faltasMap)])].sort();
        setMaterias(allMats.map(mat => ({
          materia: mat,
          cals:   perList.map(p => calMap[mat]?.[p.nombre]    ?? null),
          faltas: perList.map(p => faltasMap[mat]?.[p.nombre] ?? 0),
        })));
      })
      .catch(() => setMaterias([]))
      .finally(() => setLoading(false));
  }, [hijoActual?.id, hijoActual?.idInscripcion]);

  const promedioGeneral = (() => {
    const proms = materias.map(m => promedio(m.cals)).filter(v => v !== null);
    if (!proms.length) return null;
    return proms.reduce((a, b) => a + b, 0) / proms.length;
  })();

  const hoy = new Date();
  const periodoActivo  = periodos.find(p => new Date(p.fechaInicio) <= hoy && hoy <= new Date(p.fechaFin));
  const periodoProximo = periodoActivo
    ? periodos.find(p => new Date(p.fechaInicio) > new Date(periodoActivo.fechaFin))
    : null;

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
      {!loadingTutor && hijos.length === 0 && (
        <>
          <TablaVacia tipo="cal" />
          <div style={{ marginTop: '1.25rem' }}><TablaVacia tipo="fal" /></div>
        </>
      )}

      {!loadingTutor && hijoActual && (
        <>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--green-800) 0%, var(--green-600) 100%)',
            borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', color: '#fff', marginBottom: '1.25rem',
          }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Calificaciones</div>
            <div style={{ fontSize: 14, opacity: 0.85, marginTop: 2 }}>{hijoActual.nombre} · {hijoActual.grupo}</div>
          </div>

          {/* Info periodo actual */}
          {(periodoActivo || periodoProximo) && (
            <Card style={{ background: 'var(--blue-50)', border: '1px solid var(--blue-100)', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18, display: 'flex', alignItems: 'center' }}><Calendar size={18} /></span>
                <span style={{ fontWeight: 700, color: 'var(--blue-600)' }}>Periodo Actual</span>
              </div>
              {periodoActivo && (
                <div style={{ fontSize: 14, color: 'var(--blue-600)', marginBottom: 2 }}>
                  <strong>{periodoActivo.nombre}:</strong> {fmtFecha(periodoActivo.fechaInicio)} - {fmtFecha(periodoActivo.fechaFin)}{' '}
                  <span style={{ fontWeight: 600 }}>(Activo)</span>
                </div>
              )}
              {periodoProximo && (
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  <strong>{periodoProximo.nombre}:</strong> {fmtFecha(periodoProximo.fechaInicio)} - {fmtFecha(periodoProximo.fechaFin)} (Próximo)
                </div>
              )}
            </Card>
          )}

          {/* Cargando */}
          {loading && (
            <Card style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Cargando boleta…
            </Card>
          )}

          {/* Sin datos */}
          {!loading && materias.length === 0 && (
            <Card style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No hay calificaciones registradas aún.
            </Card>
          )}

          {/* Tablas */}
          {!loading && materias.length > 0 && (
            <>
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
                        {periodos.map(p => <th key={p.id} style={{ ...thS, minWidth: 90 }}>{p.nombre}</th>)}
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
                        {periodos.map(p => <th key={p.id} style={{ ...thS, minWidth: 90 }}>{p.nombre}</th>)}
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
        </>
      )}
    </div>
  );
}
