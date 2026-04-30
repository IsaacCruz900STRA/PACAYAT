// src/layouts/SecretariaLayout.jsx
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar   from '../components/layout/Sidebar';
import Navbar    from '../components/layout/Navbar';
import { Toast } from '../components/ui/Toast';
import HelpFAB   from '../components/ui/HelpFAB';

const NAV_ITEMS = [
  { to: '/secretaria/dashboard',  icon: '⊞', label: 'Dashboard'   },
  { to: '/secretaria/alumnos',    icon: '👥', label: 'Alumnos'     },
  { to: '/secretaria/tutores',    icon: '👨‍👩‍👧', label: 'Tutores'     },
  { to: '/secretaria/grupos',     icon: '🏫', label: 'Grupos'      },
  { to: '/secretaria/documentos', icon: '📄', label: 'Documentos'  },
  { to: '/secretaria/avisos',     icon: '🔔', label: 'Avisos'      },
  { to: '/secretaria/reportes',   icon: '📋', label: 'Reportes'    },
];

const BREADCRUMBS = {
  '/secretaria/dashboard':  'Dashboard',
  '/secretaria/alumnos':    'Alumnos',
  '/secretaria/tutores':    'Tutores',
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
