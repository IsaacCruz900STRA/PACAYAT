// src/layouts/DocenteLayout.jsx
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar  from '../components/layout/Sidebar';
import Navbar   from '../components/layout/Navbar';
import { Toast } from '../components/ui/Toast';
import HelpFAB  from '../components/ui/HelpFAB';

const NAV_ITEMS = [
  { to: '/docente/dashboard',      icon: '⊞', label: 'Inicio'         },
  { to: '/docente/horario',        icon: '📅', label: 'Horario'        },
  { to: '/docente/calificaciones', icon: '📖', label: 'Calificaciones' },
];

const BREADCRUMBS = {
  '/docente/dashboard':      'Inicio',
  '/docente/horario':        'Horario',
  '/docente/calificaciones': 'Calificaciones',
};

export default function DocenteLayout() {
  const { pathname } = useLocation();
  const breadcrumb = BREADCRUMBS[pathname] || 'Docente';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar navItems={NAV_ITEMS} />
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar breadcrumb={breadcrumb} />
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>
      <Toast />
      <HelpFAB />
    </div>
  );
}
