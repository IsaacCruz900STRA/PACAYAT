// src/layouts/ControlEscolarLayout.jsx
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar   from '../components/layout/Sidebar';
import Navbar    from '../components/layout/Navbar';
import { Toast } from '../components/ui/Toast';
import HelpFAB   from '../components/ui/HelpFAB';

const NAV_ITEMS = [
  { to: '/control-escolar/dashboard',      icon: '⊞', label: 'Inicio'                },
  { to: '/control-escolar/calificaciones', icon: '📖', label: 'Calificaciones'        },
  { to: '/control-escolar/asignaciones',   icon: '📅', label: 'Horarios'             },
  { to: '/control-escolar/reportes',       icon: '📋', label: 'Reportes'             },
  { to: '/control-escolar/periodos',       icon: '🗓', label: 'Periodos'             },
  { to: '/control-escolar/avisos',         icon: '🔔', label: 'Avisos'               },
];

const BREADCRUMBS = {
  '/control-escolar/dashboard':      'Inicio',
  '/control-escolar/calificaciones': 'Calificaciones',
  '/control-escolar/asignaciones':   'Horarios',
  '/control-escolar/reportes':       'Reportes',
  '/control-escolar/periodos':       'Periodos',
  '/control-escolar/avisos':         'Avisos',
};

export default function ControlEscolarLayout() {
  const { pathname } = useLocation();
  const breadcrumb   = BREADCRUMBS[pathname] || 'Control Escolar';
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
