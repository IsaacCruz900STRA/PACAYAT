// src/layouts/PrefectoLayout.jsx
import { useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Clock, ClipboardList, Bell } from 'lucide-react';
import Sidebar   from '../components/layout/Sidebar';
import Navbar    from '../components/layout/Navbar';
import { Toast } from '../components/ui/Toast';
import HelpFAB   from '../components/ui/HelpFAB';

const NAV_ITEMS = [
  { to: '/prefecto/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/prefecto/alumnos',   icon: <Users size={18} />,           label: 'Alumnos'   },
  { to: '/prefecto/horarios',  icon: <Clock size={18} />,           label: 'Horarios'  },
  { to: '/prefecto/reportes',  icon: <ClipboardList size={18} />,   label: 'Reportes'  },
  { to: '/prefecto/avisos',    icon: <Bell size={18} />,            label: 'Avisos'    },
];

const BREADCRUMBS = {
  '/prefecto/dashboard': 'Dashboard',
  '/prefecto/alumnos':   'Alumnos',
  '/prefecto/horarios':  'Horarios',
  '/prefecto/reportes':  'Reportes',
  '/prefecto/avisos':    'Avisos',
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
      <HelpFAB />
    </div>
  );
}
