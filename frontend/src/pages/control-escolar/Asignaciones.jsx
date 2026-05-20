// src/pages/control-escolar/Asignaciones.jsx
import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card       from '../../components/ui/Card';
import Badge      from '../../components/ui/Badge';
import api        from '../../api/client';
import { getGrupos } from '../../api/grupos.api';

const ENUM_TO_DIA = {
  LUNES: 'Lunes', MARTES: 'Martes', MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves', VIERNES: 'Viernes',
};
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

const BLOQUES = [
  { numero: 1, label: '07:00 - 07:50' },
  { numero: 2, label: '07:50 - 08:40' },
  { numero: 3, label: '08:40 - 09:30' },
  { receso: true },
  { numero: 4, label: '10:00 - 10:50' },
  { numero: 5, label: '10:50 - 11:40' },
  { numero: 6, label: '11:40 - 12:30' },
  { numero: 7, label: '12:30 - 13:20' },
  { numero: 8, label: '13:20 - 14:10' },
  { numero: 9, label: '14:10 - 15:00' },
];

const COLORES = ['#dbeafe','#dcfce7','#f3e8ff','#ffedd5','#ccfbf1','#fef3c7','#fce7f3','#e0f2fe','#f1f5f9','#fff1f2'];
function colorMateria(mat) {
  let h = 0;
  for (const c of (mat || '')) h = (h * 31 + c.charCodeAt(0)) % COLORES.length;
  return COLORES[h];
}

export default function ControlEscolarAsignaciones() {
  const [grupos,        setGrupos]        = useState([]);
  const [grupoSel,      setGrupoSel]      = useState(null);
  const [horarios,      setHorarios]      = useState([]);
  const [vista,         setVista]         = useState('horario');
  const [qFiltro,       setQFiltro]       = useState('');
  const [loadingG,      setLoadingG]      = useState(true);
  const [loadingH,      setLoadingH]      = useState(false);

  // Cargar grupos al montar
  useEffect(() => {
    getGrupos()
      .then(({ data }) => {
        const lista = data?.grupos || [];
        setGrupos(lista);
        if (lista.length > 0) setGrupoSel(lista[0]);
      })
      .catch(() => {})
      .finally(() => setLoadingG(false));
  }, []);

  // Cargar horarios cuando cambia el grupo
  const cargarHorarios = useCallback((grupo) => {
    if (!grupo) return;
    setLoadingH(true);
    api.get('/horarios', { params: { idGrupo: grupo.id } })
      .then(({ data }) => setHorarios(data?.horarios || []))
      .catch(() => setHorarios([]))
      .finally(() => setLoadingH(false));
  }, []);

  useEffect(() => {
    cargarHorarios(grupoSel);
  }, [grupoSel, cargarHorarios]);

  // Construir grid para la vista de horario
  const gridHorario = {};
  horarios.forEach(h => {
    const dia  = ENUM_TO_DIA[h.dia] || h.dia;
    const slot = h.numeroClase;
    if (!gridHorario[dia]) gridHorario[dia] = {};
    gridHorario[dia][slot] = h;
  });

  // Vista lista: filtrado
  const listaFiltrada = horarios.filter(h => {
    const q = qFiltro.toLowerCase();
    return !q ||
      h.asignacion?.materia?.nombre?.toLowerCase().includes(q) ||
      h.asignacion?.docente?.nombre?.toLowerCase().includes(q) ||
      h.asignacion?.grupo?.nombre?.toLowerCase().includes(q) ||
      (h.salon || '').toLowerCase().includes(q);
  });

  const thS = { textAlign: 'left', padding: '10px 14px', fontSize: 12, fontWeight: 600, color: 'var(--green-800)', background: 'var(--green-50)', borderBottom: '1px solid var(--border)' };
  const tdS = { padding: '11px 14px', borderBottom: '1px solid var(--border)', fontSize: 13, verticalAlign: 'middle' };
  const fs  = { padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, background: '#fff', appearance: 'none', outline: 'none', cursor: 'pointer' };

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader
        title="Asignaciones y Horarios"
        subtitle={grupoSel ? `Grupo ${grupoSel.nombre}` : 'Cargando grupos...'}
      />

      {/* Tabs vista */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem' }}>
        {[['horario', '📅 Horario por grupo'], ['lista', '📋 Lista de clases']].map(([v, l]) => (
          <button key={v} onClick={() => setVista(v)} style={{
            padding: '8px 18px', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: vista === v ? 600 : 500,
            border: '1.5px solid', cursor: 'pointer', fontFamily: 'inherit',
            borderColor: vista === v ? 'var(--green-700)' : 'var(--border)',
            background:  vista === v ? 'var(--green-700)' : '#fff',
            color:       vista === v ? '#fff' : 'var(--text-secondary)',
          }}>{l}</button>
        ))}
      </div>

      {/* Selector de grupo + buscador */}
      <Card style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <select
            value={grupoSel?.id || ''}
            onChange={e => setGrupoSel(grupos.find(g => g.id === parseInt(e.target.value)))}
            style={{ ...fs, paddingRight: 32, minWidth: 140 }}
            disabled={loadingG}
          >
            {loadingG
              ? <option>Cargando...</option>
              : grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)
            }
          </select>
          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 12, color: 'var(--text-muted)' }}>▾</span>
        </div>

        {vista === 'lista' && (
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }}>🔍</span>
            <input value={qFiltro} onChange={e => setQFiltro(e.target.value)}
              placeholder="Buscar por materia, docente o salón..."
              style={{ ...fs, width: '100%', paddingLeft: 36 }} />
          </div>
        )}
      </Card>

      {loadingH && (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando horario...</div>
      )}

      {/* ── Vista horario ── */}
      {!loadingH && vista === 'horario' && (
        <Card style={{ padding: 0, overflowX: 'auto' }}>
          <div style={{ padding: '1rem 1.25rem', background: 'var(--green-50)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', fontWeight: 700, color: 'var(--green-800)', fontSize: 15 }}>
            Horario — Grupo {grupoSel?.nombre || '—'}
          </div>

          {horarios.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
              <div style={{ fontWeight: 600 }}>Sin horario para este grupo</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>El administrador aún no ha importado o generado el horario.</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr style={{ background: 'var(--green-50)' }}>
                  <th style={{ ...thS, width: 130 }}>Hora</th>
                  {DIAS.map(d => (
                    <th key={d} style={{ ...thS, textAlign: 'center', borderLeft: '1px solid var(--border)' }}>{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BLOQUES.map((bloque, idx) => {
                  if (bloque.receso) return (
                    <tr key="receso">
                      <td colSpan={6} style={{ padding: '7px 14px', background: '#f3f4f6', textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', letterSpacing: '0.06em' }}>
                        RECESO · 09:30 - 10:00
                      </td>
                    </tr>
                  );
                  return (
                    <tr key={bloque.numero}>
                      <td style={{ padding: '8px 14px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                        {bloque.label}
                      </td>
                      {DIAS.map(dia => {
                        const h = gridHorario[dia]?.[bloque.numero];
                        const bg = h ? colorMateria(h.asignacion?.materia?.nombre) : null;
                        return (
                          <td key={dia} style={{ padding: 6, borderBottom: '1px solid var(--border)', borderLeft: '1px solid var(--border)', verticalAlign: 'top', height: 64 }}>
                            {h && (
                              <div style={{ background: bg, borderRadius: 'var(--radius)', padding: '7px 10px', height: '100%', border: `1.5px solid ${bg}88` }}>
                                <div style={{ fontSize: 12, fontWeight: 700 }}>{h.asignacion?.materia?.nombre}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
                                  {h.asignacion?.docente?.nombre?.split(' ').slice(0, 2).join(' ')}
                                </div>
                                {h.salon && (
                                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>Salón {h.salon}</div>
                                )}
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
          )}
        </Card>
      )}

      {/* ── Vista lista ── */}
      {!loadingH && vista === 'lista' && (
        <Card style={{ padding: 0 }}>
          {listaFiltrada.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
              <div style={{ fontWeight: 600 }}>{qFiltro ? 'Sin resultados para la búsqueda' : 'Sin clases registradas para este grupo'}</div>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Materia', 'Docente', 'Día', 'Bloque', 'Horario', 'Salón'].map(h => (
                        <th key={h} style={thS}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {listaFiltrada.map(h => {
                      const bloque = BLOQUES.find(b => !b.receso && b.numero === h.numeroClase);
                      return (
                        <tr key={h.id}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}>
                          <td style={{ ...tdS, fontWeight: 500 }}>{h.asignacion?.materia?.nombre || '—'}</td>
                          <td style={tdS}>{h.asignacion?.docente?.nombre || '—'}</td>
                          <td style={tdS}><Badge variant="success">{ENUM_TO_DIA[h.dia] || h.dia}</Badge></td>
                          <td style={{ ...tdS, textAlign: 'center' }}>{h.numeroClase}</td>
                          <td style={{ ...tdS, color: 'var(--text-secondary)', fontSize: 12 }}>{bloque?.label || '—'}</td>
                          <td style={{ ...tdS, color: 'var(--text-secondary)' }}>{h.salon || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)', borderTop: '1px solid var(--border)' }}>
                {listaFiltrada.length} clases registradas
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
