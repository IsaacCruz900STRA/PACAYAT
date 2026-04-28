import { useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
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
  const breadcrumb = BREADCRUMBS[pathname] || 'Admin';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar navItems={NAV_ITEMS} />
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar breadcrumb={breadcrumb} />
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
