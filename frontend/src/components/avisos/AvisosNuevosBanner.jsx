// src/components/avisos/AvisosNuevosBanner.jsx
// Banner compacto que aparece en dashboards durante 2h después de que llega un aviso nuevo
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { getAvisos }   from '../../api/avisos.api';
import { getPeriodos } from '../../api/periodos.api';
import { esAvisoVisible, hayAvisosNuevos } from './AvisosViewer';

export default function AvisosNuevosBanner({ tiposPermitidos, avisosPath }) {
  const [mostrar, setMostrar] = useState(false);
  const [cuenta,  setCuenta]  = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelado = false;
    Promise.all([getAvisos(), getPeriodos()])
      .then(([avsRes, perRes]) => {
        if (cancelado) return;
        const avisos   = avsRes.data?.avisos   || [];
        const periodos = perRes.data?.periodos  || [];
        const visibles = avisos.filter(
          a => tiposPermitidos.includes(a.tipo) && esAvisoVisible(a, periodos)
        );
        const nuevos = visibles.filter(
          a => Date.now() - new Date(a.creadoEn).getTime() <= 2 * 60 * 60 * 1000
        );
        if (nuevos.length > 0) {
          setMostrar(true);
          setCuenta(nuevos.length);
        }
      })
      .catch(() => {});
    return () => { cancelado = true; };
  }, [tiposPermitidos]);

  if (!mostrar) return null;

  return (
    <div
      onClick={() => navigate(avisosPath)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--green-700)', color: '#fff',
        borderRadius: 'var(--radius)', padding: '10px 16px',
        marginBottom: '1.25rem', cursor: 'pointer',
        boxShadow: 'var(--shadow-sm)',
        transition: 'opacity var(--transition)',
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      <Bell size={18} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>
        Tienes {cuenta} aviso{cuenta !== 1 ? 's' : ''} nuevo{cuenta !== 1 ? 's' : ''}
      </span>
      <span style={{ marginLeft: 'auto', fontSize: 13, opacity: 0.85 }}>Ver avisos →</span>
    </div>
  );
}
