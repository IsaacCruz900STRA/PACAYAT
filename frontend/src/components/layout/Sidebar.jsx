import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../utils/formatters';

const sidebarStyle = {
  width: 'var(--sidebar-width)', minHeight: '100vh',
  background: 'var(--sidebar-bg)', display: 'flex', flexDirection: 'column',
  flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
};

export default function Sidebar({ navItems }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside style={sidebarStyle}>
      {/* Brand */}
      <div style={{ padding: '1.25rem 1rem 1rem', borderBottom: '1px solid var(--sidebar-border)' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>PACAYAT</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>ST 177</div>
      </div>

      {/* User info */}
      <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--sidebar-border)' }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%', background: 'var(--green-600)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>
          {initials(user?.nombre || '')}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>{user?.nombre}</div>
          <span style={{
            fontSize: 12, fontWeight: 500, background: 'var(--green-600)',
            color: '#fff', borderRadius: 20, padding: '2px 9px', display: 'inline-block', marginTop: 4,
          }}>
            {user?.rol}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.75rem 0', overflowY: 'auto' }}>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 1rem', color: isActive ? '#fff' : 'rgba(255,255,255,0.8)',
              fontSize: 16, fontWeight: isActive ? 600 : 500,
              background: isActive ? 'var(--sidebar-active)' : 'transparent',
              textDecoration: 'none', transition: 'all var(--transition)',
              border: 'none', width: '100%',
            })}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--sidebar-hover)'}
            onMouseLeave={e => {
              const isActive = e.currentTarget.classList.contains('active');
              e.currentTarget.style.background = isActive ? 'var(--sidebar-active)' : 'transparent';
            }}
          >
            <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--sidebar-border)' }}>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          color: 'rgba(255,255,255,0.7)', fontSize: 15,
          background: 'none', border: 'none', padding: '10px 0', width: '100%',
          cursor: 'pointer', transition: 'color var(--transition)',
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
        >
          <span style={{ fontSize: 16 }}>→</span> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
