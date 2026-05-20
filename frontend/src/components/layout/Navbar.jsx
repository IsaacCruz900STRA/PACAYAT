import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { initials, rolLabel } from '../../utils/formatters';
import { getAvisos } from '../../api/avisos.api';

const TIPOS_POR_ROL = {
  ADMIN:           ['CONDUCTA', 'PERIODO_EVALUACION', 'REINSCRIPCION', 'GENERAL', 'COLABORADORES'],
  DIRECTIVO:       ['CONDUCTA', 'PERIODO_EVALUACION', 'REINSCRIPCION', 'GENERAL', 'COLABORADORES'],
  SECRETARIA:      ['CONDUCTA', 'PERIODO_EVALUACION', 'REINSCRIPCION', 'GENERAL', 'COLABORADORES'],
  CONTROL_ESCOLAR: ['CONDUCTA', 'PERIODO_EVALUACION', 'REINSCRIPCION', 'GENERAL', 'COLABORADORES'],
  DOCENTE:         ['PERIODO_EVALUACION', 'GENERAL', 'COLABORADORES'],
  PREFECTO:        ['CONDUCTA', 'GENERAL', 'COLABORADORES'],
  TUTOR:           ['CONDUCTA', 'REINSCRIPCION', 'GENERAL'],
};

const RUTA_AVISOS = {
  ADMIN:           '/admin/avisos',
  DIRECTIVO:       '/directivo/avisos',
  DOCENTE:         '/docente/avisos',
  PREFECTO:        '/prefecto/avisos',
  SECRETARIA:      '/secretaria/avisos',
  CONTROL_ESCOLAR: '/control-escolar/avisos',
  TUTOR:           '/tutor/avisos',
};

const VENTANA_NUEVA_MS = 24 * 60 * 60 * 1000; // 24 horas

function useAvisosNuevos(rol) {
  const [count, setCount] = useState(0);
  const storageKey = `avisosVistosEn_${rol}`;

  const marcarVisto = () => {
    localStorage.setItem(storageKey, Date.now().toString());
    setCount(0);
  };

  useEffect(() => {
    if (!rol) return;
    const tipos = TIPOS_POR_ROL[rol] || [];
    const vistosEn = Number(localStorage.getItem(storageKey) || 0);
    getAvisos()
      .then(res => {
        const ahora = Date.now();
        const avisos = res.data?.avisos || [];
        const nuevos = avisos.filter(a =>
          a.activo &&
          tipos.includes(a.tipo) &&
          ahora - new Date(a.creadoEn).getTime() <= VENTANA_NUEVA_MS &&
          new Date(a.creadoEn).getTime() > vistosEn
        );
        setCount(nuevos.length);
      })
      .catch(() => {});
  }, [rol, storageKey]);

  return { count, marcarVisto };
}

export default function Navbar({ breadcrumb }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { count: avisosNuevos, marcarVisto } = useAvisosNuevos(user?.rol);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleIrAvisos = () => {
    marcarVisto();
    const ruta = RUTA_AVISOS[user?.rol];
    if (ruta) navigate(ruta);
  };

  return (
    <div style={{
      background: '#fff', borderBottom: '1px solid var(--border)',
      padding: '12px 2rem', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
        PACAYAT / <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{breadcrumb}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* ── Avatar + nombre ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: 'var(--green-600)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff',
          }}>
            {initials(user?.nombre || '')}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{user?.nombre}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{rolLabel(user?.rol)}</div>
          </div>
        </div>

        {/* ── Campana de notificaciones ── */}
        <button
          type="button"
          onClick={handleIrAvisos}
          title={avisosNuevos > 0 ? `${avisosNuevos} aviso${avisosNuevos !== 1 ? 's' : ''} nuevo${avisosNuevos !== 1 ? 's' : ''}` : 'Avisos'}
          style={{
            position: 'relative',
            background: 'none',
            border: '1.5px solid var(--border)',
            borderRadius: '50%',
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: avisosNuevos > 0 ? 'var(--green-700)' : 'var(--text-secondary)',
            transition: 'background 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.borderColor = 'var(--green-600)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          <Bell size={18} />
          {avisosNuevos > 0 && (
            <span style={{
              position: 'absolute',
              top: -4,
              right: -4,
              background: '#dc2626',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              lineHeight: 1,
              border: '2px solid #fff',
              boxSizing: 'border-box',
            }}>
              {avisosNuevos > 99 ? '99+' : avisosNuevos}
            </span>
          )}
        </button>

        {/* ── Cerrar sesión ── */}
        <button type="button" onClick={handleLogout} style={{
          background: '#dc2626', color: '#fff', border: 'none', borderRadius: 10,
          padding: '10px 16px', fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 8px 20px rgba(220,38,38,0.2)', transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 22px rgba(220,38,38,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(220,38,38,0.2)'; }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
