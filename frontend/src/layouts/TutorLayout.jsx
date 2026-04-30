// src/layouts/TutorLayout.jsx
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar           from '../components/layout/Sidebar';
import Navbar            from '../components/layout/Navbar';
import { Toast }         from '../components/ui/Toast';
import { TutorProvider } from '../context/TutorContext';
import HelpFAB           from '../components/ui/HelpFAB';

const NAV_ITEMS = [
  { to: '/tutor/inicio',    icon: '⊞', label: 'Inicio'    },
  { to: '/tutor/horario',   icon: '📅', label: 'Horario'   },
  { to: '/tutor/boleta',    icon: '📖', label: 'Boleta'    },
  { to: '/tutor/reportes',  icon: '📋', label: 'Reportes'  },
  { to: '/tutor/contacto',  icon: '📞', label: 'Contacto'  },
];

const BREADCRUMBS = {
  '/tutor/inicio':   'Inicio',
  '/tutor/horario':  'Horario',
  '/tutor/boleta':   'Boleta Digital',
  '/tutor/reportes': 'Reportes',
  '/tutor/contacto': 'Contacto',
};

export default function TutorLayout() {
  const { pathname } = useLocation();
  const breadcrumb   = BREADCRUMBS[pathname] || 'Tutor';

  return (
    <TutorProvider>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar navItems={NAV_ITEMS} />
        <div style={{
          marginLeft: 'var(--sidebar-width)', flex: 1,
          display: 'flex', flexDirection: 'column',
        }}>
          <Navbar breadcrumb={breadcrumb} />
          <main style={{ flex: 1 }}>
            <Outlet />
          </main>
        </div>
        <Toast />
        <HelpFAB />
      </div>
    </TutorProvider>
  );
}
