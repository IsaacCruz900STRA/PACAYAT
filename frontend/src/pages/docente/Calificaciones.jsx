// src/pages/docente/Calificaciones.jsx
//
// Reglas de negocio:
//  · Solo el periodo ACTIVO es editable.
//  · Periodos CERRADOS y PRÓXIMOS son solo lectura.
//  · El docente selecciona grupo → aparece lista de alumnos con inputs.
//  · Guardar llama a POST /api/calificaciones/masivo.

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card     from '../../components/ui/Card';
import Button   from '../../components/ui/Button';
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

const ESTADO_STYLES = {
  ACTIVO:  { bg: '#dcfce7', color: '#14532d', dot: '#16a34a', label: 'Activo'  },
  CERRADO: { bg: '#e5e7eb', color: '#374151', dot: '#6b7280', label: 'Cerrado' },
  PROXIMO: { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6', label: 'Próximo' },
};

// ── Grupos mock (mientras no hay backend) ────────────────────────
const GRUPOS_MOCK = [
  { idAsignacion: 1, grupo: '1° A', materia: 'Matemáticas'  },
  { idAsignacion: 2, grupo: '2° B', materia: 'Álgebra'      },
  { idAsignacion: 3, grupo: '3° A', materia: 'Geometría'    },
  { idAsignacion: 4, grupo: '3° C', materia: 'Geometría'    },
];

// ── Periodos mock ─────────────────────────────────────────────────
const PERIODOS_MOCK = [
  { id: 1, nombre: 'Periodo 1', estado: 'CERRADO' },
  { id: 2, nombre: 'Periodo 2', estado: 'CERRADO' },
  { id: 3, nombre: 'Periodo 3', estado: 'ACTIVO'  },
];

// ── Alumnos mock por grupo ────────────────────────────────────────
function generarAlumnosMock(idAsignacion) {
  const base = [
    'Sofía Díaz Morales','Juan Pérez García','Ana Martínez López',
    'Carlos Ramírez Soto','Elena Torres Ruiz','Miguel Sánchez Díaz',
    'Laura González Pérez','Roberto Flores Hernández','Karla Jiménez Castro',
    'Diego Mendoza Vargas',
  ];
  return base.map((nombre, i) => ({
    id: idAsignacion * 100 + i,
    nombre,
    calificaciones: {
      1: (7 + Math.random() * 3).toFixed(1) * 1,
      2: (6.5 + Math.random() * 3).toFixed(1) * 1,
      3: null, // periodo activo — pendiente
    },
  }));
}

export default function Calificaciones() {
  const [searchParams]      = useSearchParams();
  const [grupos,   setGrupos]   = useState(GRUPOS_MOCK);
  const [periodos, setPeriodos] = useState(PERIODOS_MOCK);
  const [asignacion, setAsignacion] = useState(
    () => Number(searchParams.get('asignacion')) || GRUPOS_MOCK[0].idAsignacion
  );
  const [alumnos,  setAlumnos]  = useState([]);
  const [edits,    setEdits]    = useState({}); // { idAlumno: valor }
  const [saving,   setSaving]   = useState(false);
  const [dirty,    setDirty]    = useState(false);

  const grupoActual  = grupos.find(g => g.idAsignacion === asignacion) || grupos[0];
  const periodoActivo = periodos.find(p => p.estado === 'ACTIVO');
  const idPeriodoActivo = periodoActivo?.id;

  // Carga alumnos al cambiar grupo
  useEffect(() => {
    if (!asignacion) return;
    // TODO: reemplazar con getCalificacionesGrupo(asignacion, idPeriodoActivo)
    const data = generarAlumnosMock(asignacion);
    setAlumnos(data);
    setEdits({});
    setDirty(false);
  }, [asignacion]);

  const handleEdit = useCallback((idAlumno, valor) => {
    // Validar rango 0-10
    const num = valor === '' ? '' : parseFloat(valor);
    if (valor !== '' && (isNaN(num) || num < 0 || num > 10)) return;
    setEdits(prev => ({ ...prev, [idAlumno]: valor }));
    setDirty(true);
  }, []);

  const handleGuardar = async () => {
    // Construir payload solo con entradas válidas
    const registros = Object.entries(edits)
      .filter(([, v]) => v !== '' && !isNaN(parseFloat(v)))
      .map(([idAlumno, calificacion]) => ({
        idAlumno:           parseInt(idAlumno),
        idAsignacion:       asignacion,
        idPeriodoEvaluacion: idPeriodoActivo,
        calificacion:       parseFloat(calificacion),
      }));

    if (registros.length === 0) {
      showToast('No hay calificaciones nuevas para guardar', 'info');
      return;
    }

    setSaving(true);
    try {
      // TODO: await guardarCalificaciones(registros);
      // Simulamos éxito
      await new Promise(r => setTimeout(r, 700));
      // Actualizar estado local
      setAlumnos(prev => prev.map(a => ({
        ...a,
        calificaciones: {
          ...a.calificaciones,
          [idPeriodoActivo]: edits[a.id] !== undefined
            ? parseFloat(edits[a.id])
            : a.calificaciones[idPeriodoActivo],
        },
      })));
      setEdits({});
      setDirty(false);
      showToast('Calificaciones guardadas correctamente');
    } catch (err) {
      showToast('Error al guardar. Intenta de nuevo.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Promedio de un alumno (solo periodos con valor)
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

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader title="Calificaciones" subtitle={grupoActual ? `${grupoActual.materia} · Grupo ${grupoActual.grupo}` : ''} />

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
          <span style={{ fontSize: 18 }}>📅</span>
          <span style={{ fontWeight: 700, color: 'var(--blue-600)' }}>Periodos de Evaluación</span>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {periodos.map(p => {
            const s = ESTADO_STYLES[p.estado] || ESTADO_STYLES.CERRADO;
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue-700)' }}>{p.nombre}:</span>
                <span style={{
                  fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 20,
                  background: s.bg, color: s.color,
                }}>
                  {s.label}
                  {p.estado === 'ACTIVO' && ' · Editable'}
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
      </Card>

      {/* Tabla de calificaciones */}
      <Card style={{ padding: 0 }}>
        {/* Header de la tabla */}
        <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>
              Grupo {grupoActual?.grupo}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 12 }}>
              {alumnos.length} alumnos
            </span>
          </div>
          <Button onClick={handleGuardar} disabled={!dirty || saving}>
            {saving ? 'Guardando...' : '💾 Guardar Calificaciones'}
          </Button>
        </div>

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
                        <div style={{ fontSize: 10, fontWeight: 400, color: 'var(--green-600)', marginTop: 2 }}>✏ Editable</div>
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

                    <td style={tdStyle}>{alumno.nombre}</td>

                    {periodos.map(p => {
                      const isActivo  = p.estado === 'ACTIVO';
                      const editVal   = edits[alumno.id];
                      const calActual = alumno.calificaciones[p.id];
                      const display   = isActivo && editVal !== undefined ? editVal : calActual;

                      return (
                        <td key={p.id} style={{ ...tdStyle, textAlign: 'center' }}>
                          {isActivo ? (
                            // Input editable para periodo activo
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
                              onBlur={e => {
                                if (edits[alumno.id] === undefined) e.target.style.borderColor = 'var(--border)';
                              }}
                            />
                          ) : (
                            // Solo lectura para periodos cerrados / próximos
                            <span style={{
                              color: calActual !== null ? calColor(calActual) : 'var(--text-muted)',
                              fontWeight: calActual !== null ? 700 : 400,
                              fontSize: 14,
                            }}>
                              {calActual !== null && calActual !== undefined ? calActual.toFixed(1) : '—'}
                            </span>
                          )}
                        </td>
                      );
                    })}

                    {/* Promedio */}
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {prom !== null ? (
                        <span style={{ fontWeight: 700, fontSize: 15, color: calColor(prom) }}>
                          {prom.toFixed(1)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer con info */}
        <div style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <span>{alumnos.length} alumnos en la lista</span>
          {dirty && <span style={{ color: 'var(--green-700)', fontWeight: 600 }}>● Cambios sin guardar</span>}
        </div>
      </Card>
    </div>
  );
}
