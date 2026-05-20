// src/pages/control-escolar/Avisos.jsx — mismo CRUD que admin/GestionAvisos y secretaria/Avisos
import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card       from '../../components/ui/Card';
import Button     from '../../components/ui/Button';
import Modal      from '../../components/ui/Modal';
import { showToast } from '../../components/ui/Toast';
import { getAvisos } from '../../api/avisos.api';

const TIPO_STYLE = {
  CONDUCTA:           { border: '#ef4444', bg: '#fff5f5', badgeBg: '#fee2e2', badgeColor: '#991b1b', label: 'Conducta' },
  PERIODO_EVALUACION: { border: '#3b82f6', bg: '#eff6ff', badgeBg: '#dbeafe', badgeColor: '#1e40af', label: 'Evaluación' },
  REINSCRIPCION:      { border: '#f59e0b', bg: '#fffbeb', badgeBg: '#fef3c7', badgeColor: '#92400e', label: 'Reinscripción' },
  GENERAL:            { border: '#22c55e', bg: '#f0fdf4', badgeBg: '#dcfce7', badgeColor: '#166534', label: 'General' },
};

const DESTINATARIO_LABEL = {
  CONDUCTA: 'Tutores', REINSCRIPCION: 'Tutores',
  GENERAL: 'Todos',   PERIODO_EVALUACION: 'Tutores y Docentes',
};

function fmtFecha(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const hoy = new Date(); const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
  const misma = (a, b) => a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  const hora = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  if (misma(d, hoy))  return `Hoy, ${hora}`;
  if (misma(d, ayer)) return `Ayer, ${hora}`;
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) + `, ${hora}`;
}

export default function ControlEscolarAvisos() {
  const [tab,     setTab]     = useState('CONDUCTA');
  const [avisos,  setAvisos]  = useState([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAvisos();
      setAvisos(res.data?.avisos || []);
    } catch { showToast('Error al cargar avisos', 'error'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const avisosFiltrados = tab === 'CONDUCTA'
    ? avisos.filter(a => a.tipo === 'CONDUCTA')
    : avisos.filter(a => a.tipo !== 'CONDUCTA');

  const tabBtn = (id, label, count) => (
    <button key={id} onClick={() => setTab(id)} style={{
      padding: '8px 18px', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: tab === id ? 600 : 500,
      border: '1.5px solid', cursor: 'pointer', fontFamily: 'inherit',
      borderColor: tab === id ? 'var(--green-700)' : 'var(--border)',
      background:  tab === id ? 'var(--green-700)' : '#fff',
      color:       tab === id ? '#fff' : 'var(--text-secondary)',
    }}>{label} ({count})</button>
  );

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader
        title="Avisos"
        subtitle={loading ? 'Cargando...' : `${avisos.length} avisos activos`}
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        {tabBtn('CONDUCTA', 'Conducta',  avisos.filter(a => a.tipo === 'CONDUCTA').length)}
        {tabBtn('GENERAL',  'Generales', avisos.filter(a => a.tipo !== 'CONDUCTA').length)}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Cargando...</div>
      ) : avisosFiltrados.length === 0 ? (
        <Card style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
          <div style={{ fontWeight: 600 }}>Sin avisos en esta categoría</div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {avisosFiltrados.map(aviso => {
            const st = TIPO_STYLE[aviso.tipo] || TIPO_STYLE.GENERAL;
            return (
              <div key={aviso.id} style={{ background: st.bg, border: `1px solid ${st.border}`, borderLeftWidth: 4, borderRadius: 'var(--radius-lg)', padding: '1.25rem', opacity: aviso.activo ? 1 : 0.6 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{aviso.titulo}</h3>
                      <span style={{ background: st.badgeBg, color: st.badgeColor, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>{st.label}</span>
                      {!aviso.activo && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#e5e7eb', color: '#6b7280' }}>Inactivo</span>}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 6px', lineHeight: 1.5 }}>{aviso.mensaje}</p>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtFecha(aviso.creadoEn)}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                      <strong>Destinatarios:</strong> {DESTINATARIO_LABEL[aviso.tipo] || 'Todos'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
