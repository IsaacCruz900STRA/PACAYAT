// src/layouts/PrefectoLayout.jsx
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar  from '../components/layout/Navbar';
import { Toast } from '../components/ui/Toast';

const NAV_ITEMS = [
  { to: '/prefecto/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/prefecto/alumnos',   icon: '👥', label: 'Alumnos'   },
  { to: '/prefecto/horarios',  icon: '📅', label: 'Horarios'  },
  { to: '/prefecto/reportes',  icon: '📋', label: 'Reportes'  },
];

const BREADCRUMBS = {
  '/prefecto/dashboard': 'Dashboard',
  '/prefecto/alumnos':   'Alumnos',
  '/prefecto/horarios':  'Horarios',
  '/prefecto/reportes':  'Reportes',
};

export default function PrefectoLayout() {
  const { pathname } = useLocation();
  const breadcrumb = BREADCRUMBS[pathname] || 'Prefecto';
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar navItems={NAV_ITEMS} />
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar breadcrumb={breadcrumb} />
        <main style={{ flex: 1 }}><Outlet /></main>
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
