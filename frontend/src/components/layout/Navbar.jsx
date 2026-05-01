import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { initials } from '../../utils/formatters';

export default function Navbar({ breadcrumb }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
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
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Admin del sistema</div>
          </div>
        </div>
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
