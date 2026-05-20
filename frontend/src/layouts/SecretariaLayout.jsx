// src/layouts/SecretariaLayout.jsx
import { useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, FileText, Bell, ClipboardList } from 'lucide-react';
import Sidebar   from '../components/layout/Sidebar';
import Navbar    from '../components/layout/Navbar';
import { Toast } from '../components/ui/Toast';
import HelpFAB   from '../components/ui/HelpFAB';

const NAV_ITEMS = [
  { to: '/secretaria/dashboard',  icon: <LayoutDashboard size={18} />, label: 'Inicio'      },
  { to: '/secretaria/alumnos',    icon: <Users size={18} />,           label: 'Alumnos'     },
  { to: '/secretaria/grupos',     icon: <Building2 size={18} />,       label: 'Grupos'      },
  { to: '/secretaria/documentos', icon: <FileText size={18} />,        label: 'Documentos'  },
  { to: '/secretaria/avisos',     icon: <Bell size={18} />,            label: 'Avisos'      },
  { to: '/secretaria/reportes',   icon: <ClipboardList size={18} />,   label: 'Reportes'    },
];

const BREADCRUMBS = {
  '/secretaria/dashboard':  'Inicio',
  '/secretaria/alumnos':    'Alumnos',
  '/secretaria/grupos':     'Grupos',
  '/secretaria/documentos': 'Documentos',
  '/secretaria/avisos':     'Avisos',
  '/secretaria/reportes':   'Reportes',
};

export default function SecretariaLayout() {
  const { pathname } = useLocation();
  const breadcrumb   = BREADCRUMBS[pathname] || 'Secretaría';
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
