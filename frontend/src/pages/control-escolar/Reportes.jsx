// src/pages/control-escolar/Reportes.jsx — API real + ModalCrearReporte
import { useState, useEffect, useRef, useCallback } from 'react';
import PageHeader        from '../../components/layout/PageHeader';
import Card              from '../../components/ui/Card';
import Button            from '../../components/ui/Button';
import ModalCrearReporte from '../../components/reportes/ModalCrearReporte';
import { buscarAlumnos } from '../../api/alumnos.api';
import { getReportes }   from '../../api/reportes.api';
import { showToast }     from '../../components/ui/Toast';
import { formatDateTime } from '../../utils/formatters';

const GRAVEDAD_LABEL = {
  GRAVE: 'Grave (-10 pts)', MEDIO: 'Medio (-5 pts)', NO_GRAVE: 'No grave (-2 pts)',
  MUY_POSITIVO: 'Muy positivo (+6 pts)', MEDIANAMENTE: 'Medianamente (+4 pts)', LEVE: 'Leve (+2 pts)',
};

function ptsBadgeStyle(pts) {
  if (pts <= 45) return { bg: '#fee2e2', color: '#991b1b' };
  if (pts <= 65) return { bg: '#ffedd5', color: '#c2410c' };
  if (pts <= 79) return { bg: '#fef3c7', color: '#92400e' };
  return { bg: '#dcfce7', color: '#166534' };
}

export default function ControlEscolarReportes() {
  const [query,          setQuery]          = useState('');
  const [resultados,     setResultados]     = useState([]);
  const [alumno,         setAlumno]         = useState(null);
  const [reportes,       setReportes]       = useState([]);
  const [filtro,         setFiltro]         = useState('Todos');
  const [showDrop,       setShowDrop]       = useState(false);
  const [modal,          setModal]          = useState(false);
  const [loadingSearch,  setLoadingSearch]  = useState(false);
  const [loadingReportes,setLoadingReportes]= useState(false);
  const ref = useRef();

  const cargarReportes = useCallback(async (alumnoId) => {
    setLoadingReportes(true);
    try {
      const res = await getReportes({ idAlumno: alumnoId, limit: 100 });
      setReportes(res.data?.reportes || []);
    } catch {
      showToast('Error al cargar reportes', 'error');
    } finally {
      setLoadingReportes(false);
    }
  }, []);

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    if (query.length < 2 || alumno) { setResultados([]); setShowDrop(false); return; }
    setLoadingSearch(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await buscarAlumnos(query);
        setResultados(data || []);
        setShowDrop(true);
      } catch { setResultados([]); }
      finally { setLoadingSearch(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query, alumno]);

  const seleccionar = (a) => {
    const sel = { ...a, nombreCompleto: a.nombre || a.nombreCompleto };
    setAlumno(sel);
    setQuery(sel.nombreCompleto || sel.nombre);
    setShowDrop(false);
    setResultados([]);
    setFiltro('Todos');
    cargarReportes(sel.id);
  };

  const limpiar = () => {
    setAlumno(null); setQuery(''); setReportes([]); setResultados([]);
  };

  const reportesFiltrados = filtro === 'Todos'
    ? reportes
    : reportes.filter(r => r.tipo === filtro.toUpperCase());

  const countPos = reportes.filter(r => r.tipo === 'POSITIVO').length;
  const countNeg = reportes.filter(r => r.tipo === 'NEGATIVO').length;

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader
        title="Reportes"
        subtitle="Historial de conducta por alumno"
        action={<Button onClick={() => setModal(true)}>+ Crear Reporte</Button>}
      />

      {/* Buscador */}
      <Card style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div ref={ref} style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 15 }}>🔍</span>
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setAlumno(null); }}
            placeholder="Buscar alumno por nombre o matrícula…"
            style={{ width: '100%', padding: '11px 40px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => { e.target.style.borderColor = 'var(--green-600)'; if (resultados.length) setShowDrop(true); }}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          {query && (
            <button onClick={limpiar} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}>✕</button>
          )}
          {showDrop && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', zIndex: 100 }}>
              {loadingSearch && <div style={{ padding: '10px 14px', fontSize: 14, color: 'var(--text-secondary)' }}>Buscando...</div>}
              {!loadingSearch && resultados.map(a => {
                const st = ptsBadgeStyle(a.puntosConducta);
                return (
                  <div key={a.id} onClick={() => seleccionar(a)}
                    style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--green-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <span style={{ fontSize: 16 }}>👤</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{a.nombre}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.matricula} · {a.grupo}</div>
                    </div>
                    <span style={{ background: st.bg, color: st.color, fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>{a.puntosConducta} pts</span>
                  </div>
                );
              })}
              {!loadingSearch && query.length >= 2 && resultados.length === 0 && (
                <div style={{ padding: '14px', fontSize: 14, color: 'var(--text-secondary)' }}>Sin resultados para "{query}"</div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Sin alumno */}
      {!alumno && (
        <Card style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Busca un alumno</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Ingresa el nombre o matrícula para ver su historial de reportes.</p>
        </Card>
      )}

      {/* Historial del alumno */}
      {alumno && (
        <>
          <div style={{
            background: 'linear-gradient(135deg, var(--green-800) 0%, var(--green-600) 100%)',
            borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', color: '#fff',
            marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>Historial de Reportes</div>
              <div style={{ fontSize: 14, opacity: 0.85, marginTop: 3 }}>{alumno.nombreCompleto || alumno.nombre}</div>
            </div>
            <button onClick={limpiar} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)', padding: '6px 14px', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
              ← Volver
            </button>
          </div>

          <Card style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>🔽 Filtrar:</span>
            {[
              { label: `Todos (${reportes.length})`, val: 'Todos',    bg: 'var(--green-700)' },
              { label: `Positivos (${countPos})`,    val: 'Positivo', bg: '#16a34a' },
              { label: `Negativos (${countNeg})`,    val: 'Negativo', bg: '#ef4444' },
            ].map(f => (
              <button key={f.val} onClick={() => setFiltro(f.val)} style={{
                padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: filtro === f.val ? 700 : 500,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: filtro === f.val ? f.bg : '#f3f4f6',
                color: filtro === f.val ? '#fff' : 'var(--text-secondary)',
              }}>{f.label}</button>
            ))}
          </Card>

          {loadingReportes ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando reportes...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reportesFiltrados.map(r => {
                const isNeg = r.tipo === 'NEGATIVO';
                const delta = r.puntosDespues - r.puntosAntes;
                return (
                  <Card key={r.id} style={{ padding: '1.25rem', borderLeft: `4px solid ${isNeg ? '#ef4444' : '#22c55e'}`, background: isNeg ? '#fef2f2' : '#f0fdf4', borderRadius: '0 var(--radius-lg) var(--radius-lg) 0' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                          <span style={{ background: isNeg ? '#fee2e2' : '#dcfce7', color: isNeg ? '#991b1b' : '#166534', fontSize: 13, fontWeight: 700, padding: '3px 12px', borderRadius: 20 }}>
                            {isNeg ? 'Negativo' : 'Positivo'}
                          </span>
                          <span style={{ background: '#f3f4f6', color: 'var(--text-secondary)', fontSize: 13, padding: '3px 12px', borderRadius: 20 }}>
                            {GRAVEDAD_LABEL[r.gravedad] || r.gravedad}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>📅 {formatDateTime(r.creadoEn)}</div>
                        <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>{r.descripcion}</p>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                          <strong>Reportado por:</strong> {r.usuarioReporta?.nombre || '—'} · {r.usuarioReporta?.rol || ''}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Puntos de conducta</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 18, fontWeight: 700 }}>{r.puntosAntes}</span>
                          <span style={{ color: isNeg ? '#ef4444' : '#16a34a', fontSize: 16 }}>{isNeg ? '↘' : '↗'}</span>
                          <span style={{ fontSize: 18, fontWeight: 700, color: isNeg ? '#ef4444' : '#16a34a' }}>{r.puntosDespues}</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isNeg ? '#ef4444' : '#16a34a', marginTop: 4 }}>
                          {delta > 0 ? '+' : ''}{delta} pts
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
              {reportesFiltrados.length === 0 && (
                <Card style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No hay reportes de tipo "{filtro}" para este alumno.
                </Card>
              )}
            </div>
          )}
        </>
      )}

      <ModalCrearReporte
        open={modal}
        onClose={() => setModal(false)}
        alumnoPreset={alumno ? { id: alumno.id, nombre: alumno.nombreCompleto || alumno.nombre, matricula: alumno.matricula, puntosConducta: alumno.puntosConducta } : null}
        onSuccess={() => { setModal(false); if (alumno) cargarReportes(alumno.id); showToast('Reporte guardado'); }}
      />
    </div>
  );
}
