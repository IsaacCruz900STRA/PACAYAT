// src/pages/secretaria/GestionGrupos.jsx
import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card       from '../../components/ui/Card';
import Badge      from '../../components/ui/Badge';
import { getGrupos }  from '../../api/grupos.api';
import { getAlumnos } from '../../api/alumnos.api';

function ptsBadgeStyle(pts) {
  if (pts >= 70) return { bg: '#dcfce7', color: '#16a34a' };
  if (pts >= 55) return { bg: '#fef9c3', color: '#ca8a04' };
  return { bg: '#fee2e2', color: '#dc2626' };
}

export default function SecretariaGrupos() {
  const [grupos,          setGrupos]          = useState([]);
  const [alumnos,         setAlumnos]          = useState([]);
  const [grupoSel,        setGrupoSel]         = useState(null);
  const [q,               setQ]                = useState('');
  const [loadingGrupos,   setLoadingGrupos]    = useState(true);
  const [loadingAlumnos,  setLoadingAlumnos]   = useState(false);

  // Cargar grupos al montar
  useEffect(() => {
    getGrupos()
      .then(({ data }) => {
        const lista = data?.grupos || [];
        setGrupos(lista);
        if (lista.length > 0) setGrupoSel(lista[0]);
      })
      .catch(() => {})
      .finally(() => setLoadingGrupos(false));
  }, []);

  // Cargar alumnos cada vez que cambia el grupo seleccionado
  const cargarAlumnos = useCallback((grupo) => {
    if (!grupo) return;
    setLoadingAlumnos(true);
    setAlumnos([]);
    getAlumnos({ grupo: grupo.nombre, limit: 500 })
      .then(({ data }) => setAlumnos(data?.alumnos || []))
      .catch(() => {})
      .finally(() => setLoadingAlumnos(false));
  }, []);

  useEffect(() => {
    cargarAlumnos(grupoSel);
  }, [grupoSel, cargarAlumnos]);

  const seleccionar = (grupo) => { setGrupoSel(grupo); setQ(''); };

  // Filtro local de búsqueda
  const alumnosFiltrados = alumnos.filter(a =>
    !q ||
    a.nombreCompleto.toLowerCase().includes(q.toLowerCase()) ||
    a.matricula.includes(q)
  );

  const resumen = {
    total:    alumnos.length,
    activos:  alumnos.filter(a => a.activo).length,
    enRiesgo: alumnos.filter(a => a.puntosConducta < 60).length,
    promedio: alumnos.length
      ? Math.round(alumnos.reduce((s, a) => s + (a.puntosConducta ?? 0), 0) / alumnos.length)
      : 0,
  };

  // Agrupar grupos por grado
  const porGrado = grupos.reduce((acc, g) => {
    const k = g.grado || 0;
    if (!acc[k]) acc[k] = [];
    acc[k].push(g);
    return acc;
  }, {});
  const grados = Object.keys(porGrado).sort((a, b) => a - b);

  const fs  = { padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, background: '#fff', appearance: 'none', outline: 'none', cursor: 'pointer' };
  const thS = { textAlign: 'left', padding: '10px 14px', fontSize: 13, fontWeight: 600, color: 'var(--green-800)', background: 'var(--green-50)', borderBottom: '1px solid var(--border)' };
  const tdS = { padding: '12px 14px', borderBottom: '1px solid var(--border)', fontSize: 14, verticalAlign: 'middle' };

  if (loadingGrupos) {
    return (
      <div style={{ padding: '0 2rem 2rem' }}>
        <PageHeader title="Grupos" subtitle="Cargando grupos..." />
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Cargando...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader
        title="Grupos"
        subtitle={grupoSel ? `Grupo ${grupoSel.nombre} · ${resumen.total} alumnos` : 'Selecciona un grupo'}
      />

      {/* Selector de grupo por grado */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Seleccionar grupo:</div>
        {grupos.length === 0 ? (
          <div style={{ fontSize: 14, color: 'var(--text-muted)', padding: '1rem 0' }}>No hay grupos registrados.</div>
        ) : (
          grados.map(grado => (
            <div key={grado} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', width: 32, flexShrink: 0 }}>{grado}°</span>
              {porGrado[grado].map(g => {
                const active = grupoSel?.id === g.id;
                const count  = active ? alumnos.length : null;
                return (
                  <button key={g.id} onClick={() => seleccionar(g)} style={{
                    padding: '6px 16px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: active ? 700 : 500,
                    border: '1.5px solid', cursor: 'pointer', fontFamily: 'inherit',
                    borderColor: active ? 'var(--green-700)' : 'var(--border)',
                    background:  active ? 'var(--green-700)' : '#fff',
                    color:       active ? '#fff' : 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {g.nombre}
                    {active && count !== null && (
                      <span style={{ fontSize: 11, opacity: 0.8 }}>({count})</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Resumen del grupo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Total alumnos',     value: resumen.total,    color: 'var(--text-primary)' },
          { label: 'Activos',           value: resumen.activos,  color: '#16a34a' },
          { label: 'En riesgo',         value: resumen.enRiesgo, color: '#dc2626' },
          { label: 'Promedio conducta',  value: `${resumen.promedio} pts`, color: resumen.promedio >= 70 ? '#16a34a' : resumen.promedio >= 55 ? '#d97706' : '#dc2626' },
        ].map(s => (
          <Card key={s.label} style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Buscador */}
      <Card style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }}>🔍</span>
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder={`Buscar en ${grupoSel?.nombre || '...'} por nombre o matrícula...`}
            style={{ ...fs, width: '100%', paddingLeft: 36 }} />
        </div>
      </Card>

      {/* Tabla de alumnos */}
      <Card style={{ padding: 0 }}>
        <div style={{ padding: '1rem 1.25rem', background: 'var(--green-50)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--green-800)' }}>Grupo {grupoSel?.nombre || '—'}</h3>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{alumnosFiltrados.length} alumnos</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loadingAlumnos ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando alumnos...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Matrícula', 'Nombre Completo', 'Puntos Conducta', 'Tutor', 'Estado'].map(h => (
                    <th key={h} style={thS}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {alumnosFiltrados.map(a => {
                  const { bg, color } = ptsBadgeStyle(a.puntosConducta ?? 100);
                  return (
                    <tr key={a.id}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ ...tdS, color: 'var(--text-secondary)', fontSize: 13 }}>{a.matricula}</td>
                      <td style={{ ...tdS, fontWeight: 500 }}>{a.nombreCompleto}</td>
                      <td style={tdS}>
                        <span style={{ background: bg, color, fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
                          {a.puntosConducta ?? 100} pts
                        </span>
                      </td>
                      <td style={{ ...tdS, fontSize: 13 }}>{a.tutor || '—'}</td>
                      <td style={tdS}>
                        <Badge variant={a.activo ? 'success' : 'neutral'}>{a.estado || (a.activo ? 'Activo' : 'Inactivo')}</Badge>
                      </td>
                    </tr>
                  );
                })}
                {alumnosFiltrados.length === 0 && !loadingAlumnos && (
                  <tr><td colSpan={5} style={{ ...tdS, textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    {q ? 'No se encontraron alumnos con ese criterio.' : 'No hay alumnos en este grupo.'}
                  </td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <div style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)', borderTop: '1px solid var(--border)' }}>
          {alumnosFiltrados.length} alumnos en {grupoSel?.nombre || '—'}
        </div>
      </Card>
    </div>
  );
}
