// src/layouts/TutorLayout.jsx
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar       from '../components/layout/Sidebar';
import Navbar        from '../components/layout/Navbar';
import { Toast }     from '../components/ui/Toast';
import { TutorProvider } from '../context/TutorContext';

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
        <button style={{
          position: 'fixed', bottom: 24, right: 24, width: 44, height: 44,
          borderRadius: '50%', background: '#374151', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 700, cursor: 'pointer',
          boxShadow: 'var(--shadow-md)', zIndex: 300, border: 'none',
        }}>?</button>
      </div>
    </TutorProvider>
  );
}
