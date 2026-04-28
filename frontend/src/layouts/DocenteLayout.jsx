// src/layouts/DocenteLayout.jsx
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar  from '../components/layout/Navbar';
import { Toast } from '../components/ui/Toast';

const NAV_ITEMS = [
  { to: '/docente/dashboard',      icon: '⊞', label: 'Dashboard'      },
  { to: '/docente/horario',        icon: '📅', label: 'Horario'        },
  { to: '/docente/calificaciones', icon: '📖', label: 'Calificaciones' },
  { to: '/docente/avisos',         icon: '🔔', label: 'Avisos'         },
];

const BREADCRUMBS = {
  '/docente/dashboard':      'Dashboard',
  '/docente/horario':        'Horario',
  '/docente/calificaciones': 'Calificaciones',
  '/docente/avisos':         'Avisos',
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
