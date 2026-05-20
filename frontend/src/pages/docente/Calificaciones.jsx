// src/pages/docente/Calificaciones.jsx
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, Calendar, Save, Pencil } from 'lucide-react';
import Card      from '../../components/ui/Card';
import Button    from '../../components/ui/Button';
import PageHeader from '../../components/layout/PageHeader';
import { showToast } from '../../components/ui/Toast';
import {
  getMisGrupos,
  getCalificacionesGrupo,
  guardarCalificaciones,
  getPeriodos,
} from '../../api/calificaciones.api';

// ── Helpers ──────────────────────────────────────────────────────
const calColor = (v) => {
  if (v === null || v === undefined) return 'var(--text-muted)';
  if (v < 6)   return '#dc2626';
  if (v < 7.5) return '#d97706';
  return '#16a34a';
};

function calcularEstadoPeriodo(fechaInicio, fechaFin) {
  const hoy   = new Date(); hoy.setHours(0, 0, 0, 0);
  const inicio = new Date(fechaInicio); inicio.setHours(0, 0, 0, 0);
  const fin    = new Date(fechaFin);    fin.setHours(0, 0, 0, 0);
  if (hoy >= inicio && hoy <= fin) return 'ACTIVO';
  if (hoy > fin) return 'CERRADO';
  return 'PROXIMO';
}

const ESTADO_STYLES = {
  ACTIVO:  { bg: '#dcfce7', color: '#14532d', dot: '#16a34a', label: 'Activo'  },
  CERRADO: { bg: '#e5e7eb', color: '#374151', dot: '#6b7280', label: 'Cerrado' },
  PROXIMO: { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6', label: 'Próximo' },
};

export default function Calificaciones() {
  const [searchParams]       = useSearchParams();
  const [grupos,    setGrupos]    = useState([]);
  const [periodos,  setPeriodos]  = useState([]);
  const [asignacion, setAsignacion] = useState(null);
  const [alumnos,   setAlumnos]   = useState([]);
  const [edits,     setEdits]     = useState({});
  const [saving,    setSaving]    = useState(false);
  const [dirty,     setDirty]     = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);
  const [confirmOpen,  setConfirmOpen]  = useState(false);
  const [countdown,    setCountdown]    = useState(5);

  const grupoActual    = grupos.find(g => g.idAsignacion === asignacion) || null;
  const periodoActivo  = periodos.find(p => p.estado === 'ACTIVO') || null;
  const idPeriodoActivo = periodoActivo?.id;

  // ── Carga inicial: grupos + periodos ────────────────────────────
  useEffect(() => {
    Promise.all([getMisGrupos(), getPeriodos()])
      .then(([gruposRes, periodosRes]) => {
        const gs = gruposRes.data?.grupos || [];
        const rawP = periodosRes.data?.periodos || [];
        const ps = rawP.map(p => ({
          ...p,
          estado: calcularEstadoPeriodo(p.fechaInicio, p.fechaFin),
        }));
        setGrupos(gs);
        setPeriodos(ps);
        if (gs.length > 0) {
          const init = Number(searchParams.get('asignacion')) || gs[0].idAsignacion;
          setAsignacion(init);
        }
      })
      .catch(() => showToast('Error al cargar grupos o periodos', 'error'))
      .finally(() => setLoading(false));
  }, []);

  // ── Carga calificaciones al cambiar asignacion ──────────────────
  useEffect(() => {
    if (!asignacion || !periodos.length) return;
    setLoadingAlumnos(true);
    setEdits({});
    setDirty(false);

    Promise.all(
      periodos.map(p =>
        getCalificacionesGrupo(asignacion, p.id).catch(() => ({ data: { alumnos: [] } }))
      )
    )
      .then(responses => {
        const base = responses[0]?.data?.alumnos || [];
        const merged = base.map(alumno => {
          const calificaciones = {};
          responses.forEach((res, j) => {
            const match = (res.data?.alumnos || []).find(a => a.id === alumno.id);
            calificaciones[periodos[j].id] = match?.calificacion ?? null;
          });
          return { ...alumno, calificaciones };
        });
        setAlumnos(merged);
      })
      .catch(() => showToast('Error al cargar calificaciones', 'error'))
      .finally(() => setLoadingAlumnos(false));
  }, [asignacion, periodos]);

  // ── Cuenta regresiva del modal ──────────────────────────────────
  useEffect(() => {
    if (!confirmOpen || countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [confirmOpen, countdown]);

  // ── Edición de celdas ───────────────────────────────────────────
  const handleEdit = useCallback((idAlumno, valor) => {
    const num = valor === '' ? '' : parseFloat(valor);
    if (valor !== '' && (isNaN(num) || num < 0 || num > 10)) return;
    setEdits(prev => ({ ...prev, [idAlumno]: valor }));
    setDirty(true);
  }, []);

  // ── Abrir modal de confirmación ─────────────────────────────────
  const abrirConfirm = () => {
    const tiene = Object.entries(edits).some(([, v]) => v !== '' && !isNaN(parseFloat(v)));
    if (!tiene) {
      showToast('No hay calificaciones nuevas para guardar', 'info');
      return;
    }
    setCountdown(5);
    setConfirmOpen(true);
  };

  // ── Guardar en BD ───────────────────────────────────────────────
  const ejecutarGuardado = async () => {
    setConfirmOpen(false);
    const registros = Object.entries(edits)
      .filter(([, v]) => v !== '' && !isNaN(parseFloat(v)))
      .map(([idAlumno, calificacion]) => {
        const alumno = alumnos.find(a => String(a.id) === String(idAlumno));
        return {
          idInscripcion: alumno?.idInscripcion,
          idAsignacion:  asignacion,
          idPeriodo:     idPeriodoActivo,
          calificacion:  parseFloat(calificacion),
        };
      })
      .filter(r => r.idInscripcion != null);

    setSaving(true);
    try {
      await guardarCalificaciones(registros);
      // Refrescar calificaciones del periodo activo
      const res = await getCalificacionesGrupo(asignacion, idPeriodoActivo);
      const actualizados = res.data?.alumnos || [];
      setAlumnos(prev => prev.map(alumno => {
        const nuevo = actualizados.find(a => a.id === alumno.id);
        return {
          ...alumno,
          calificaciones: {
            ...alumno.calificaciones,
            [idPeriodoActivo]: nuevo?.calificacion ?? alumno.calificaciones[idPeriodoActivo],
          },
        };
      }));
      setEdits({});
      setDirty(false);
      showToast('Calificaciones guardadas correctamente');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al guardar. Intenta de nuevo.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Promedio por alumno ─────────────────────────────────────────
  const promedioAlumno = (alumno) => {
    const vals = periodos.map(p => {
      if (p.id === idPeriodoActivo && edits[alumno.id] !== undefined && edits[alumno.id] !== '') {
        return parseFloat(edits[alumno.id]);
      }
      return alumno.calificaciones[p.id];
    }).filter(v => v !== null && v !== undefined && !isNaN(v));
    if (!vals.length) return null;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) * 1;
  };

  const thStyle = {
    padding: '10px 14px', textAlign: 'left', fontSize: 13, fontWeight: 600,
    color: 'var(--green-800)', background: 'var(--green-50)',
    borderBottom: '1px solid var(--border)',
  };
  const tdStyle = {
    padding: '10px 14px', borderBottom: '1px solid var(--border)',
    fontSize: 14, verticalAlign: 'middle',
  };

  if (loading) {
    return (
      <div style={{ padding: '0 2rem 2rem' }}>
        <PageHeader title="Calificaciones" subtitle="Cargando..." />
        <Card style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Cargando grupos y periodos...
        </Card>
      </div>
    );
  }

  if (!grupos.length) {
    return (
      <div style={{ padding: '0 2rem 2rem' }}>
        <PageHeader title="Calificaciones" subtitle="Sin grupos asignados" />
        <Card style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No tienes grupos asignados en este periodo.
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader
        title="Calificaciones"
        subtitle={grupoActual ? `${grupoActual.materia} · Grupo ${grupoActual.grupo}` : ''}
      />

      {/* Selector de grupo */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {grupos.map(g => (
          <button key={g.idAsignacion} onClick={() => setAsignacion(g.idAsignacion)}
            style={{
              padding: '8px 18px', borderRadius: 'var(--radius)',
              border: '1.5px solid', cursor: 'pointer', fontSize: 14, fontWeight: 500,
              fontFamily: 'inherit', transition: 'all var(--transition)',
              borderColor: asignacion === g.idAsignacion ? 'var(--green-700)' : 'var(--border)',
              background:  asignacion === g.idAsignacion ? 'var(--green-700)' : '#fff',
              color:       asignacion === g.idAsignacion ? '#fff' : 'var(--text-secondary)',
            }}>
            {g.grupo} — {g.materia}
          </button>
        ))}
      </div>

      {/* Indicador de periodos */}
      <Card style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', background: 'var(--blue-50)', border: '1px solid var(--blue-100)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Calendar size={18} color="var(--blue-600)" />
          <span style={{ fontWeight: 700, color: 'var(--blue-600)' }}>Periodos de Evaluación</span>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {periodos.map(p => {
            const s = ESTADO_STYLES[p.estado] || ESTADO_STYLES.CERRADO;
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue-700)' }}>{p.nombre}:</span>
                <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: s.bg, color: s.color }}>
                  {s.label}{p.estado === 'ACTIVO' && ' · Editable'}
                </span>
              </div>
            );
          })}
        </div>
        {periodoActivo && (
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--blue-100)' }}>
            Solo puedes editar calificaciones del <strong>{periodoActivo.nombre}</strong>. Los periodos cerrados son de solo lectura.
          </p>
        )}
        {!periodoActivo && periodos.length > 0 && (
          <p style={{ fontSize: 12, color: '#92400e', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--blue-100)' }}>
            No hay un periodo de evaluación activo en este momento. Las calificaciones son de solo lectura.
          </p>
        )}
      </Card>

      {/* Tabla de calificaciones */}
      <Card style={{ padding: 0 }}>
        <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Grupo {grupoActual?.grupo}</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 12 }}>
              {loadingAlumnos ? 'Cargando...' : `${alumnos.length} alumnos`}
            </span>
          </div>
          <Button onClick={abrirConfirm} disabled={!dirty || saving || !periodoActivo} icon={<Save size={14} />}>
            {saving ? 'Guardando...' : 'Guardar Calificaciones'}
          </Button>
        </div>

        {loadingAlumnos ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Cargando calificaciones...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, minWidth: 200 }}>Alumno</th>
                  {periodos.map(p => {
                    const isActivo = p.estado === 'ACTIVO';
                    return (
                      <th key={p.id} style={{
                        ...thStyle, textAlign: 'center', minWidth: 110,
                        color: isActivo ? 'var(--green-800)' : 'var(--text-secondary)',
                      }}>
                        {p.nombre}
                        {isActivo && (
                          <div style={{ fontSize: 10, fontWeight: 400, color: 'var(--green-600)', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                            <Pencil size={9} /> Editable
                          </div>
                        )}
                      </th>
                    );
                  })}
                  <th style={{ ...thStyle, textAlign: 'center', minWidth: 100 }}>Promedio</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map(alumno => {
                  const prom = promedioAlumno(alumno);
                  return (
                    <tr key={alumno.id}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>

                      <td style={tdStyle}>
                        <div style={{ fontWeight: 500 }}>{alumno.nombreCompleto}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{alumno.matricula}</div>
                      </td>

                      {periodos.map(p => {
                        const isActivo  = p.estado === 'ACTIVO';
                        const editVal   = edits[alumno.id];
                        const calActual = alumno.calificaciones[p.id];
                        const display   = isActivo && editVal !== undefined ? editVal : calActual;

                        return (
                          <td key={p.id} style={{ ...tdStyle, textAlign: 'center' }}>
                            {isActivo ? (
                              <input
                                type="number"
                                min={0} max={10} step={0.1}
                                value={editVal !== undefined ? editVal : (calActual ?? '')}
                                onChange={e => handleEdit(alumno.id, e.target.value)}
                                placeholder="—"
                                style={{
                                  width: 70, padding: '5px 8px', textAlign: 'center',
                                  border: '1.5px solid',
                                  borderColor: editVal !== undefined ? 'var(--green-600)' : 'var(--border)',
                                  borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 600,
                                  background: editVal !== undefined ? 'var(--green-50)' : '#fff',
                                  color: display !== null && display !== '' ? calColor(parseFloat(display)) : 'var(--text-muted)',
                                  outline: 'none',
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--green-600)'}
                                onBlur={e => { if (edits[alumno.id] === undefined) e.target.style.borderColor = 'var(--border)'; }}
                              />
                            ) : (
                              <span style={{
                                color: calActual !== null ? calColor(calActual) : 'var(--text-muted)',
                                fontWeight: calActual !== null ? 700 : 400,
                                fontSize: 14,
                              }}>
                                {calActual !== null && calActual !== undefined ? Number(calActual).toFixed(1) : '—'}
                              </span>
                            )}
                          </td>
                        );
                      })}

                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        {prom !== null ? (
                          <span style={{ fontWeight: 700, fontSize: 15, color: calColor(prom) }}>{prom.toFixed(1)}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!loadingAlumnos && alumnos.length === 0 && (
                  <tr>
                    <td colSpan={periodos.length + 2} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)' }}>
                      No hay alumnos inscritos en este grupo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <span>{alumnos.length} alumnos en la lista</span>
          {dirty && <span style={{ color: 'var(--green-700)', fontWeight: 600 }}>● Cambios sin guardar</span>}
        </div>
      </Card>

      {/* Modal de confirmación con cuenta regresiva */}
      {confirmOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 20,
        }}>
          <div style={{
            background: '#fff', borderRadius: 14, padding: '2rem 2.25rem',
            width: '100%', maxWidth: 460, boxShadow: '0 12px 48px rgba(0,0,0,0.22)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14, color: '#d97706' }}>
              <AlertTriangle size={44} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: 10 }}>
              ¿Confirmar guardado de calificaciones?
            </div>
            <div style={{
              fontSize: 13, color: '#7f1d1d', background: '#fef2f2',
              border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px',
              textAlign: 'center', marginBottom: 10, lineHeight: 1.6,
            }}>
              Una vez cerrado el periodo de evaluación,{' '}
              <strong>no podrás modificar las calificaciones registradas</strong>.
              Asegúrate de que los datos sean correctos antes de confirmar.
            </div>
            {periodoActivo && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 16 }}>
                Estás guardando calificaciones del <strong>{periodoActivo.nombre}</strong>.
              </div>
            )}
            {countdown > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: '50%',
                  border: '3px solid var(--green-700)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, fontWeight: 800, color: 'var(--green-700)',
                }}>
                  {countdown}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmOpen(false)}
                style={{
                  padding: '10px 22px', borderRadius: 8, border: '1.5px solid #d1d5db',
                  background: '#fff', fontSize: 14, cursor: 'pointer',
                  fontFamily: 'inherit', fontWeight: 600,
                }}
              >
                Cancelar
              </button>
              <button
                disabled={countdown > 0}
                onClick={ejecutarGuardado}
                style={{
                  padding: '10px 26px', borderRadius: 8, border: 'none',
                  background: countdown > 0 ? '#86efac' : 'var(--green-700)',
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', transition: 'background .3s',
                }}
              >
                {countdown > 0 ? `Confirmar (${countdown}s)` : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
