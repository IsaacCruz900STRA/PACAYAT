// src/layouts/DirectivoLayout.jsx
import { useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, User, Calendar, ClipboardList, BarChart2, Bell } from 'lucide-react';
import Sidebar   from '../components/layout/Sidebar';
import Navbar    from '../components/layout/Navbar';
import { Toast } from '../components/ui/Toast';

const NAV_ITEMS = [
  { to: '/directivo/dashboard',    icon: <LayoutDashboard size={18} />, label: 'Inicio'    },
  { to: '/directivo/alumnos',      icon: <Users size={18} />,           label: 'Alumnos'      },
  { to: '/directivo/personal',     icon: <User size={18} />,            label: 'Personal'     },
  { to: '/directivo/horarios',     icon: <Calendar size={18} />,        label: 'Horarios'     },
  { to: '/directivo/reportes',     icon: <ClipboardList size={18} />,   label: 'Reportes'     },
  { to: '/directivo/estadisticas', icon: <BarChart2 size={18} />,       label: 'Estadísticas' },
  { to: '/directivo/avisos',       icon: <Bell size={18} />,            label: 'Avisos'       },
];

const BREADCRUMBS = {
  '/directivo/dashboard':    'Inicio',
  '/directivo/alumnos':      'Alumnos',
  '/directivo/personal':     'Personal',
  '/directivo/horarios':     'Horarios',
  '/directivo/reportes':     'Reportes',
  '/directivo/estadisticas': 'Estadísticas',
  '/directivo/avisos':       'Avisos',
};

export default function DirectivoLayout() {
  const { pathname } = useLocation();
  const breadcrumb   = BREADCRUMBS[pathname] || 'Directivo';
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
