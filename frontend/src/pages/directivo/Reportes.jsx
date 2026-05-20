// src/pages/directivo/Reportes.jsx — API real + crear reportes
import { useState, useEffect, useRef, useCallback } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card       from '../../components/ui/Card';
import Button     from '../../components/ui/Button';
import Modal      from '../../components/ui/Modal';
import { showToast } from '../../components/ui/Toast';
import { getReportes, createReporte } from '../../api/reportes.api';
import { buscarAlumnos } from '../../api/alumnos.api';

const GRAVEDAD_LABEL = {
  GRAVE:         'Grave',
  MEDIO:         'Medio',
  NO_GRAVE:      'No grave',
  MUY_POSITIVO:  'Muy positivo',
  MEDIANAMENTE:  'Medianamente positivo',
  LEVE:          'Leve',
};

const GRAVEDAD_POR_TIPO = {
  NEGATIVO: ['GRAVE', 'MEDIO', 'NO_GRAVE'],
  POSITIVO: ['MUY_POSITIVO', 'MEDIANAMENTE', 'LEVE'],
};

const FORM_INICIAL = { alumnoId: null, alumnoNombre: '', tipo: 'NEGATIVO', gravedad: 'MEDIO', descripcion: '' };

function ptsBadgeStyle(pts) {
  if (pts == null) return { bg: '#f3f4f6', color: '#6b7280' };
  if (pts >= 70) return { bg: '#dcfce7', color: '#16a34a' };
  if (pts >= 55) return { bg: '#fef9c3', color: '#ca8a04' };
  return { bg: '#fee2e2', color: '#dc2626' };
}

function fmtFecha(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DirectivoReportes() {
  const [reportes,      setReportes]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filtroGlobal,  setFiltroGlobal]  = useState('Todos');
  // búsqueda alumno para historial
  const [query,         setQuery]         = useState('');
  const [results,       setResults]       = useState([]);
  const [showDrop,      setShowDrop]      = useState(false);
  const [alumnoSel,     setAlumnoSel]     = useState(null);
  const [vistaGlobal,   setVistaGlobal]   = useState(true);
  const [filtroAlumno,  setFiltroAlumno]  = useState('Todos');
  // modal crear reporte
  const [modalOpen,     setModalOpen]     = useState(false);
  const [form,          setForm]          = useState(FORM_INICIAL);
  const [busqModal,     setBusqModal]     = useState('');
  const [resModal,      setResModal]      = useState([]);
  const [saving,        setSaving]        = useState(false);
  const ref = useRef();

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getReportes();
      setReportes(res.data?.reportes || []);
    } catch { showToast('Error al cargar reportes', 'error'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // Cerrar dropdown al click fuera
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // Búsqueda de alumno (historial)
  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await buscarAlumnos(query);
        setResults(res.data || []);
        setShowDrop(true);
      } catch {}
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  // Búsqueda alumno en modal
  useEffect(() => {
    if (busqModal.length < 2) { setResModal([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await buscarAlumnos(busqModal);
        setResModal(res.data || []);
      } catch {}
    }, 250);
    return () => clearTimeout(t);
  }, [busqModal]);

  const seleccionar = (a) => {
    setAlumnoSel(a); setQuery(a.nombreCompleto || a.nombre); setShowDrop(false);
    setResults([]); setFiltroAlumno('Todos'); setVistaGlobal(false);
  };
  const limpiar = () => { setAlumnoSel(null); setQuery(''); setVistaGlobal(true); };

  // Reportes globales filtrados
  const reportesGlobal = filtroGlobal === 'Todos'
    ? reportes
    : reportes.filter(r => r.tipo === filtroGlobal.toUpperCase());

  // Reportes del alumno seleccionado
  const reportesAlumno = alumnoSel
    ? reportes.filter(r => r.alumno?.id === alumnoSel.id || r.idAlumno === alumnoSel.id)
    : [];
  const filtradosAlumno = filtroAlumno === 'Todos'
    ? reportesAlumno
    : reportesAlumno.filter(r => r.tipo === filtroAlumno.toUpperCase());

  // Crear reporte
  const abrirModal = () => {
    setForm(FORM_INICIAL);
    setBusqModal('');
    setResModal([]);
    setModalOpen(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!form.alumnoId) { showToast('Selecciona un alumno', 'error'); return; }
    if (!form.descripcion.trim()) { showToast('La descripción es obligatoria', 'error'); return; }
    setSaving(true);
    try {
      await createReporte({ idAlumno: form.alumnoId, tipo: form.tipo, gravedad: form.gravedad, descripcion: form.descripcion.trim() });
      showToast('Reporte creado correctamente');
      setModalOpen(false);
      cargar();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al crear reporte', 'error');
    } finally { setSaving(false); }
  };

  const thS = { textAlign: 'left', padding: '10px 14px', fontSize: 13, fontWeight: 600, color: 'var(--green-800)', background: 'var(--green-50)', borderBottom: '1px solid var(--border)' };
  const tdS = { padding: '11px 14px', borderBottom: '1px solid var(--border)', fontSize: 13, verticalAlign: 'middle' };
  const inputS = { width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, outline: 'none', fontFamily: 'inherit' };

  const filtroBtn = (val, label, color) => (
    <button key={val} onClick={() => setFiltroGlobal(val)} style={{
      padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
      fontWeight: filtroGlobal === val ? 700 : 500, border: '1.5px solid transparent',
      background: filtroGlobal === val ? (color || 'var(--green-700)') : '#f3f4f6',
      color: filtroGlobal === val ? '#fff' : 'var(--text-secondary)',
    }}>{label}</button>
  );

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader
        title="Reportes"
        subtitle="Historial de conducta de la institución"
        action={<Button onClick={abrirModal}>+ Nuevo Reporte</Button>}
      />

      {/* Buscador alumno */}
      <Card style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div ref={ref} style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 15 }}>🔍</span>
          <input value={query}
            onChange={e => { setQuery(e.target.value); setAlumnoSel(null); setVistaGlobal(false); }}
            placeholder="Buscar alumno por nombre o matrícula para ver su historial..."
            style={{ width: '100%', padding: '11px 40px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, outline: 'none' }}
          />
          {query && <button onClick={limpiar} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}>✕</button>}
          {showDrop && results.length > 0 && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', zIndex: 100, overflow: 'hidden' }}>
              {results.map(a => {
                const { bg, color } = ptsBadgeStyle(a.puntosConducta);
                return (
                  <div key={a.id} onClick={() => seleccionar(a)}
                    style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--green-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <span style={{ fontSize: 16 }}>👤</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{a.nombreCompleto || a.nombre}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.matricula} · {a.grupo}</div>
                    </div>
                    <span style={{ background: bg, color, fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>{a.puntosConducta ?? '—'} pts</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {alumnoSel && (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: 'var(--green-100)', color: 'var(--green-800)', fontSize: 13, fontWeight: 600, padding: '3px 12px', borderRadius: 20 }}>
              👤 {alumnoSel.nombreCompleto || alumnoSel.nombre} · {alumnoSel.grupo}
            </span>
            <button onClick={limpiar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'inherit' }}>← Ver todos los reportes</button>
          </div>
        )}
      </Card>

      {/* Vista global */}
      {vistaGlobal && (
        <>
          <Card style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>🔽 Tipo:</span>
            {filtroBtn('Todos',    `Todos (${reportes.length})`,                              'var(--green-700)')}
            {filtroBtn('Negativo', `Negativos (${reportes.filter(r => r.tipo === 'NEGATIVO').length})`, '#ef4444')}
            {filtroBtn('Positivo', `Positivos (${reportes.filter(r => r.tipo === 'POSITIVO').length})`, '#16a34a')}
          </Card>

          {loading ? (
            <Card style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando reportes...</Card>
          ) : (
            <Card style={{ padding: 0 }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['Fecha', 'Alumno', 'Grupo', 'Tipo', 'Gravedad', 'Descripción', 'Por'].map(h => <th key={h} style={thS}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {reportesGlobal.length === 0 ? (
                      <tr><td colSpan={7} style={{ ...tdS, textAlign: 'center', color: 'var(--text-muted)' }}>Sin reportes</td></tr>
                    ) : reportesGlobal.map(r => {
                      const isNeg = r.tipo === 'NEGATIVO';
                      return (
                        <tr key={r.id} style={{ cursor: 'pointer' }}
                          onClick={() => { setAlumnoSel({ id: r.alumno?.id || r.idAlumno, nombreCompleto: r.alumno?.nombreCompleto, grupo: r.inscripcion?.grupo?.nombre || '—' }); setQuery(r.alumno?.nombreCompleto || ''); setVistaGlobal(false); }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}>
                          <td style={{ ...tdS, fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{fmtFecha(r.creadoEn)}</td>
                          <td style={{ ...tdS, fontWeight: 500 }}>{r.alumno?.nombreCompleto || '—'}</td>
                          <td style={tdS}>{r.inscripcion?.grupo?.nombre || '—'}</td>
                          <td style={tdS}><span style={{ background: isNeg ? '#fee2e2' : '#dcfce7', color: isNeg ? '#991b1b' : '#166534', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{isNeg ? 'Negativo' : 'Positivo'}</span></td>
                          <td style={{ ...tdS, fontSize: 12, color: 'var(--text-secondary)' }}>{GRAVEDAD_LABEL[r.gravedad] || r.gravedad}</td>
                          <td style={{ ...tdS, maxWidth: 180 }}>{r.descripcion}</td>
                          <td style={{ ...tdS, fontSize: 12, color: 'var(--text-secondary)' }}>{r.usuarioReporta?.nombre || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)', borderTop: '1px solid var(--border)' }}>
                {reportesGlobal.length} reportes · Clic en fila para ver historial
              </div>
            </Card>
          )}
        </>
      )}

      {/* Historial de alumno */}
      {!vistaGlobal && alumnoSel && (
        <>
          <div style={{ background: 'linear-gradient(135deg,var(--green-800) 0%,var(--green-600) 100%)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', color: '#fff', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Historial de Reportes</div>
            <div style={{ fontSize: 14, opacity: .85, marginTop: 2 }}>{alumnoSel.nombreCompleto} · {alumnoSel.grupo}</div>
          </div>
          <Card style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>🔽 Tipo:</span>
            {['Todos', 'Negativo', 'Positivo'].map(val => (
              <button key={val} onClick={() => setFiltroAlumno(val)} style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: filtroAlumno === val ? 700 : 500, border: '1.5px solid transparent',
                background: filtroAlumno === val ? (val === 'Negativo' ? '#ef4444' : val === 'Positivo' ? '#16a34a' : 'var(--green-700)') : '#f3f4f6',
                color: filtroAlumno === val ? '#fff' : 'var(--text-secondary)',
              }}>{val}</button>
            ))}
          </Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtradosAlumno.length === 0
              ? <Card style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Sin reportes de tipo "{filtroAlumno}".</Card>
              : filtradosAlumno.map(r => {
                const isNeg = r.tipo === 'NEGATIVO';
                return (
                  <Card key={r.id} style={{ padding: '1.25rem', borderLeft: `4px solid ${isNeg ? '#ef4444' : '#22c55e'}`, background: isNeg ? '#fef2f2' : '#f0fdf4', borderRadius: '0 var(--radius-lg) var(--radius-lg) 0' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                          <span style={{ background: isNeg ? '#fee2e2' : '#dcfce7', color: isNeg ? '#991b1b' : '#166534', fontSize: 13, fontWeight: 700, padding: '3px 12px', borderRadius: 20 }}>{isNeg ? 'Negativo' : 'Positivo'}</span>
                          <span style={{ background: '#f3f4f6', color: 'var(--text-secondary)', fontSize: 13, padding: '3px 12px', borderRadius: 20 }}>{GRAVEDAD_LABEL[r.gravedad] || r.gravedad}</span>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>📅 {fmtFecha(r.creadoEn)}</div>
                        <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>{r.descripcion}</p>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}><strong>Generado por:</strong> {r.usuarioReporta?.nombre || '—'}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Puntos conducta</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 18, fontWeight: 700 }}>{r.puntosAntes}</span>
                          <span style={{ fontSize: 16, color: isNeg ? '#ef4444' : '#16a34a' }}>{isNeg ? '↘' : '↗'}</span>
                          <span style={{ fontSize: 18, fontWeight: 700, color: isNeg ? '#ef4444' : '#16a34a' }}>{r.puntosDespues}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            }
          </div>
        </>
      )}

      {/* Modal crear reporte */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Reporte de Conducta" width={520}>
        <form onSubmit={handleGuardar}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {/* Buscar alumno */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Alumno *</label>
              {form.alumnoNombre ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: 'var(--green-100)', color: 'var(--green-800)', padding: '5px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                    👤 {form.alumnoNombre}
                  </span>
                  <button type="button" onClick={() => { setForm(p => ({ ...p, alumnoId: null, alumnoNombre: '' })); setBusqModal(''); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14 }}>✕</button>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <input value={busqModal} onChange={e => setBusqModal(e.target.value)}
                    placeholder="Escribe el nombre o matrícula..." style={inputS} />
                  {resModal.length > 0 && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', zIndex: 200, maxHeight: 200, overflowY: 'auto' }}>
                      {resModal.map(a => (
                        <div key={a.id} onClick={() => { setForm(p => ({ ...p, alumnoId: a.id, alumnoNombre: a.nombreCompleto || a.nombre })); setBusqModal(''); setResModal([]); }}
                          style={{ padding: '9px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: 13 }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--green-50)'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}>
                          <strong>{a.nombreCompleto || a.nombre}</strong> — {a.matricula} · {a.grupo}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Tipo */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Tipo *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['NEGATIVO', 'POSITIVO'].map(t => (
                  <button key={t} type="button" onClick={() => setForm(p => ({ ...p, tipo: t, gravedad: t === 'NEGATIVO' ? 'MEDIO' : 'MEDIANAMENTE' }))} style={{
                    flex: 1, padding: '8px', borderRadius: 'var(--radius)', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    border: `1.5px solid ${form.tipo === t ? (t === 'NEGATIVO' ? '#ef4444' : '#16a34a') : 'var(--border)'}`,
                    background: form.tipo === t ? (t === 'NEGATIVO' ? '#fee2e2' : '#dcfce7') : '#fff',
                    color: form.tipo === t ? (t === 'NEGATIVO' ? '#991b1b' : '#166534') : 'var(--text-secondary)',
                  }}>{t === 'NEGATIVO' ? '⬇ Negativo' : '⬆ Positivo'}</button>
                ))}
              </div>
            </div>
            {/* Gravedad */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Gravedad *</label>
              <select value={form.gravedad} onChange={e => setForm(p => ({ ...p, gravedad: e.target.value }))} style={{ ...inputS, appearance: 'none' }}>
                {GRAVEDAD_POR_TIPO[form.tipo].map(g => <option key={g} value={g}>{GRAVEDAD_LABEL[g]}</option>)}
              </select>
            </div>
            {/* Descripción */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Descripción *</label>
              <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                placeholder="Describe el comportamiento observado..." rows={4}
                style={{ ...inputS, resize: 'vertical' }} required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '9px 18px', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>Cancelar</button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear Reporte'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
