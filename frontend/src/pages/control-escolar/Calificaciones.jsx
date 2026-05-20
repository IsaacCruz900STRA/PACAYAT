// src/pages/control-escolar/Calificaciones.jsx
// Vista de solo lectura: calificaciones por grupo → materia → alumnos × periodos
import { useState, useEffect, useCallback } from 'react';
import { Eye, BookOpen, Inbox } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card       from '../../components/ui/Card';
import Badge      from '../../components/ui/Badge';
import { getGrupos }  from '../../api/grupos.api';
import { getPeriodos } from '../../api/periodos.api';
import api from '../../api/client';

function calColor(v) {
  if (v === null || v === undefined) return { color: 'var(--text-muted)', bg: 'transparent' };
  if (v < 6)   return { color: '#dc2626', bg: '#fee2e2' };
  if (v < 7)   return { color: '#d97706', bg: '#fef3c7' };
  if (v < 9)   return { color: '#16a34a', bg: '#dcfce7' };
  return { color: '#15803d', bg: '#bbf7d0' };
}

function promedio(grades, periodoIds) {
  const vals = periodoIds.map(id => grades[id]).filter(v => v !== null && v !== undefined);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export default function ControlEscolarCalificaciones() {
  const [grupos,        setGrupos]        = useState([]);
  const [grupoSel,      setGrupoSel]      = useState(null);
  const [asignaciones,  setAsignaciones]  = useState([]); // { id, materia, docente }
  const [asignacionSel, setAsignacionSel] = useState(null);
  const [periodos,      setPeriodos]      = useState([]);
  const [rows,          setRows]          = useState([]); // { id, nombreCompleto, matricula, grades: {periodoId: cal} }
  const [loadingGrupos, setLoadingGrupos] = useState(true);
  const [loadingAsig,   setLoadingAsig]   = useState(false);
  const [loadingCals,   setLoadingCals]   = useState(false);

  // Cargar grupos y periodos al montar
  useEffect(() => {
    Promise.all([getGrupos(), getPeriodos()])
      .then(([rg, rp]) => {
        const lista = rg.data?.grupos || [];
        setGrupos(lista);
        setPeriodos(rp.data?.periodos || []);
        if (lista.length) setGrupoSel(lista[0]);
      })
      .catch(() => {})
      .finally(() => setLoadingGrupos(false));
  }, []);

  // Al cambiar grupo: obtener asignaciones desde horarios
  useEffect(() => {
    if (!grupoSel) return;
    setAsignaciones([]);
    setAsignacionSel(null);
    setRows([]);
    setLoadingAsig(true);

    api.get('/horarios', { params: { idGrupo: grupoSel.id } })
      .then(({ data }) => {
        const horarios = data?.horarios || [];
        // Extraer asignaciones únicas
        const map = {};
        horarios.forEach(h => {
          const a = h.asignacion;
          if (a && !map[a.id]) {
            map[a.id] = {
              id:      a.id,
              materia: a.materia?.nombre || '—',
              docente: a.docente?.nombre || '—',
            };
          }
        });
        const lista = Object.values(map).sort((a, b) => a.materia.localeCompare(b.materia));
        setAsignaciones(lista);
        if (lista.length) setAsignacionSel(lista[0]);
      })
      .catch(() => setAsignaciones([]))
      .finally(() => setLoadingAsig(false));
  }, [grupoSel]);

  // Al cambiar asignacion o periodos: cargar calificaciones de todos los periodos
  const cargarCalificaciones = useCallback(async (asig, periodosList) => {
    if (!asig || !periodosList.length) { setRows([]); return; }
    setLoadingCals(true);
    try {
      const resultados = await Promise.all(
        periodosList.map(p =>
          api.get('/calificaciones/grupo', { params: { idAsignacion: asig.id, idPeriodo: p.id } })
            .then(r => ({ periodoId: p.id, alumnos: r.data?.alumnos || [] }))
            .catch(() => ({ periodoId: p.id, alumnos: [] }))
        )
      );

      // Construir mapa alumno → { info, grades }
      const alumnosMap = {};
      resultados.forEach(({ periodoId, alumnos }) => {
        alumnos.forEach(a => {
          if (!alumnosMap[a.id]) {
            alumnosMap[a.id] = {
              id:             a.id,
              idInscripcion:  a.idInscripcion,
              nombreCompleto: a.nombreCompleto,
              matricula:      a.matricula,
              grades:         {},
            };
          }
          alumnosMap[a.id].grades[periodoId] = a.calificacion;
        });
      });

      setRows(
        Object.values(alumnosMap).sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto))
      );
    } finally {
      setLoadingCals(false);
    }
  }, []);

  useEffect(() => {
    cargarCalificaciones(asignacionSel, periodos);
  }, [asignacionSel, periodos, cargarCalificaciones]);

  const periodoIds = periodos.map(p => p.id);

  const fs = { padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, background: '#fff', appearance: 'none', outline: 'none', cursor: 'pointer' };
  const thS = { padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--green-800)', background: 'var(--green-50)', borderBottom: '1px solid var(--border)', borderLeft: '1px solid var(--border)', textAlign: 'center', whiteSpace: 'nowrap' };
  const tdS = { padding: '10px 12px', borderBottom: '1px solid var(--border)', fontSize: 13, verticalAlign: 'middle', textAlign: 'center', borderLeft: '1px solid var(--border)' };

  if (loadingGrupos) {
    return (
      <div style={{ padding: '0 2rem 2rem' }}>
        <PageHeader title="Calificaciones" subtitle="Cargando..." />
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Cargando grupos...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader
        title="Calificaciones"
        subtitle="Consulta las calificaciones capturadas por los docentes (solo lectura)"
      />

      {/* Aviso solo lectura */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius)', padding: '10px 16px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#1e40af' }}>
        <span style={{ fontSize: 16, display: 'flex', alignItems: 'center' }}><Eye size={16} /></span>
        <span>Vista de solo lectura. Las calificaciones son capturadas por cada docente en su módulo.</span>
      </div>

      {/* Selectores: grupo y materia */}
      <Card style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Selector de grupo */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Grupo</label>
          <div style={{ position: 'relative' }}>
            <select
              value={grupoSel?.id || ''}
              onChange={e => setGrupoSel(grupos.find(g => g.id === parseInt(e.target.value)))}
              style={{ ...fs, paddingRight: 32, minWidth: 120 }}
            >
              {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
            </select>
            <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 11, color: 'var(--text-muted)' }}>▾</span>
          </div>
        </div>

        {/* Selector de materia */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Materia / Asignación</label>
          {loadingAsig ? (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '9px 0' }}>Cargando materias...</div>
          ) : asignaciones.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '9px 0' }}>Sin horario configurado para este grupo</div>
          ) : (
            <div style={{ position: 'relative' }}>
              <select
                value={asignacionSel?.id || ''}
                onChange={e => setAsignacionSel(asignaciones.find(a => a.id === parseInt(e.target.value)))}
                style={{ ...fs, paddingRight: 32, width: '100%' }}
              >
                {asignaciones.map(a => (
                  <option key={a.id} value={a.id}>{a.materia} — {a.docente}</option>
                ))}
              </select>
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 11, color: 'var(--text-muted)' }}>▾</span>
            </div>
          )}
        </div>

        {/* Info asignacion seleccionada */}
        {asignacionSel && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Badge variant="info">{asignacionSel.materia}</Badge>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Prof. {asignacionSel.docente}</span>
          </div>
        )}
      </Card>

      {/* Tabla de calificaciones */}
      {!asignacionSel ? (
        <Card style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 40, marginBottom: 12, display: 'flex', justifyContent: 'center' }}><BookOpen size={40} /></div>
          <div style={{ fontWeight: 600 }}>Selecciona un grupo y una materia</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Verás el listado de alumnos con sus calificaciones por periodo.</div>
        </Card>
      ) : loadingCals ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Cargando calificaciones...</div>
      ) : (
        <Card style={{ padding: 0, overflowX: 'auto' }}>
          {/* Encabezado info */}
          <div style={{ padding: '0.75rem 1.25rem', background: 'var(--green-50)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--green-800)' }}>
              {grupoSel?.nombre} · {asignacionSel?.materia}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {rows.length} alumnos · {periodos.length} periodos
            </div>
          </div>

          {rows.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: 32, marginBottom: 8, display: 'flex', justifyContent: 'center' }}><Inbox size={32} /></div>
              <div style={{ fontWeight: 600 }}>Sin calificaciones capturadas aún</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>El docente no ha registrado calificaciones para esta materia.</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
              <thead>
                <tr>
                  <th style={{ ...thS, textAlign: 'left', borderLeft: 'none', minWidth: 200 }}>Alumno</th>
                  <th style={{ ...thS, minWidth: 90, borderLeft: '1px solid var(--border)' }}>Matrícula</th>
                  {periodos.map(p => (
                    <th key={p.id} style={{ ...thS, minWidth: 90 }}>{p.nombre}</th>
                  ))}
                  <th style={{ ...thS, minWidth: 90 }}>Promedio</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const prom = promedio(row.grades, periodoIds);
                  const promStyle = calColor(prom);
                  return (
                    <tr key={row.id}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 14, fontWeight: 500 }}>
                        {row.nombreCompleto}
                      </td>
                      <td style={{ ...tdS, color: 'var(--text-secondary)', fontSize: 12 }}>
                        {row.matricula}
                      </td>
                      {periodos.map(p => {
                        const val = row.grades[p.id];
                        const st  = calColor(val);
                        return (
                          <td key={p.id} style={tdS}>
                            {val !== null && val !== undefined
                              ? <span style={{ background: st.bg, color: st.color, fontWeight: 700, padding: '3px 10px', borderRadius: 20, fontSize: 13 }}>
                                  {Number(val).toFixed(1)}
                                </span>
                              : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                            }
                          </td>
                        );
                      })}
                      <td style={tdS}>
                        {prom !== null
                          ? <span style={{ background: promStyle.bg, color: promStyle.color, fontWeight: 700, padding: '3px 12px', borderRadius: 20, fontSize: 14 }}>
                              {prom.toFixed(1)}
                            </span>
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  );
}
