// src/pages/secretaria/Avisos.jsx
import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import { getAvisos } from '../../api/avisos.api';

function fmtHora(iso) {
  const d   = new Date(iso);
  const hoy = new Date();
  const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
  const mismaFecha = (a, b) =>
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  const hora = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  if (mismaFecha(d, hoy))  return `Hoy, ${hora}`;
  if (mismaFecha(d, ayer)) return `Ayer, ${hora}`;
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) + `, ${hora}`;
}

const TIPO_CONFIG = {
  CONDUCTA:           { color: '#ef4444', bg: '#fef2f2', icon: '⚠️', label: 'Conducta'    },
  PERIODO_EVALUACION: { color: '#3b82f6', bg: '#eff6ff', icon: '🔔', label: 'Evaluación'  },
  REINSCRIPCION:      { color: '#f97316', bg: '#fff7ed', icon: '📋', label: 'Reinscripción'},
  GENERAL:            { color: '#22c55e', bg: '#f0fdf4', icon: 'ℹ',  label: 'General'     },
};

const DESTINATARIO_LABEL = {
  CONDUCTA:           'Tutores',
  PERIODO_EVALUACION: 'Tutores y Docentes',
  REINSCRIPCION:      'Tutores',
  GENERAL:            'Todos',
};

const FILTROS = ['Todos', 'Conducta', 'Generales'];

export default function SecretariaAvisos() {
  const [filtro,     setFiltro]     = useState('Todos');
  const [expandidos, setExpandidos] = useState({});
  const [avisos,     setAvisos]     = useState([]);
  const [loading,    setLoading]    = useState(true);

  const cargar = useCallback(() => {
    setLoading(true);
    getAvisos()
      .then(({ data }) => setAvisos(data?.avisos || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const toggle = (id) => setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));

  const filtrados = filtro === 'Todos'
    ? avisos
    : filtro === 'Conducta'
      ? avisos.filter(a => a.tipo === 'CONDUCTA')
      : avisos.filter(a => a.tipo !== 'CONDUCTA');

  const conteo = {
    Conducta:  avisos.filter(a => a.tipo === 'CONDUCTA').length,
    Generales: avisos.filter(a => a.tipo !== 'CONDUCTA').length,
  };

  const btnFiltro = (f) => ({
    padding: '7px 16px', borderRadius: 20, fontSize: 13,
    fontWeight: filtro === f ? 700 : 500, cursor: 'pointer',
    border: '1.5px solid transparent', fontFamily: 'inherit',
    transition: 'all var(--transition)',
    ...(filtro === f
      ? { background: 'var(--green-700)', color: '#fff' }
      : { background: '#f3f4f6', color: 'var(--text-secondary)' }
    ),
  });

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader
        title="Avisos"
        subtitle={loading ? 'Cargando...' : `Avisos activos: ${avisos.filter(a => a.activo).length}`}
      />

      <Card style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)', marginRight: 4 }}>🔽 Filtrar:</span>
          {FILTROS.map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={btnFiltro(f)}>
              {f === 'Todos' ? `Todos (${avisos.length})` : `${f} (${conteo[f] ?? 0})`}
            </button>
          ))}
        </div>
      </Card>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando avisos...</div>
      ) : filtrados.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', background: '#fff', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
          <div style={{ fontWeight: 600 }}>Sin avisos en esta categoría</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtrados.map(aviso => {
            const cfg = TIPO_CONFIG[aviso.tipo] || TIPO_CONFIG.GENERAL;
            return (
              <div key={aviso.id} style={{
                background: cfg.bg,
                border: `1px solid ${cfg.color}`,
                borderLeftWidth: 4,
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                opacity: aviso.activo ? 1 : 0.6,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#fff', border: `1.5px solid ${cfg.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0,
                  }}>
                    {cfg.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{aviso.titulo}</h3>
                      {!aviso.activo && (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#e5e7eb', color: '#6b7280' }}>Inactivo</span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 0, lineHeight: 1.5 }}>
                      {aviso.mensaje}
                    </p>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{fmtHora(aviso.creadoEn)}</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${cfg.color}33`, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span style={{ fontWeight: 600 }}>Destinatarios:</span> {DESTINATARIO_LABEL[aviso.tipo] || 'Todos'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
