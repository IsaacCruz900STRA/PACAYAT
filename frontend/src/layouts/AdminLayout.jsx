import { useLocation, useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { Toast } from '../components/ui/Toast';

const NAV_ITEMS = [
  { to: '/admin/dashboard',  icon: '⊞', label: 'Inicio' },
  { to: '/admin/alumnos',    icon: '👥', label: 'Alumnos' },
  { to: '/admin/personal',   icon: '👤', label: 'Personal' },
  { to: '/admin/periodos',   icon: '📅', label: 'Configurar Periodos' },
  { to: '/admin/avisos',    icon: '🔔', label: 'Avisos' },
  { to: '/admin/horarios',  icon: '📅', label: 'Horarios' },
  { to: '/admin/config',     icon: '⚙️', label: 'Configuración' },
];

const BREADCRUMBS = {
  '/admin/dashboard':  'Inicio',
  '/admin/alumnos':    'Alumnos',
  '/admin/personal':   'Personal',
  '/admin/periodos':   'Configurar Periodos',
  '/admin/avisos':    'Avisos',
  '/admin/horarios':  'Horarios',
  '/admin/config':     'Configuración',
};

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const breadcrumb = BREADCRUMBS[pathname] || 'Admin';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar navItems={NAV_ITEMS} />
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar breadcrumb={breadcrumb} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.75rem 2rem', background: '#fff', borderBottom: '1px solid var(--border)' }}>
          <button type="button" onClick={handleLogout} style={{
            background: '#dc2626', color: '#fff', border: 'none', borderRadius: 10,
            padding: '10px 16px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 20px rgba(220,38,38,0.2)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 22px rgba(220,38,38,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(220,38,38,0.2)'; }}
          >
            Cerrar sesión
          </button>
        </div>
        <main style={{ flex: 1, padding: 0 }}>
          <Outlet />
        </main>
      </div>
      <Toast />
      <button style={{
        position: 'fixed', bottom: 24, right: 24, width: 44, height: 44,
        borderRadius: '50%', background: '#374151', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, fontWeight: 700, cursor: 'pointer',
        boxShadow: 'var(--shadow-md)', zIndex: 300, border: 'none',
      }}>?</button>
    </div>
  );
}
