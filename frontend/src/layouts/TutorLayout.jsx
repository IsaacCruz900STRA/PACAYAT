// src/layouts/TutorLayout.jsx
import { useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Clock, BookOpen, ClipboardList, Phone, Bell } from 'lucide-react';
import Sidebar           from '../components/layout/Sidebar';
import Navbar            from '../components/layout/Navbar';
import { Toast }         from '../components/ui/Toast';
import { TutorProvider } from '../context/TutorContext';
import HelpFAB           from '../components/ui/HelpFAB';

const NAV_ITEMS = [
  { to: '/tutor/inicio',    icon: <LayoutDashboard size={18} />, label: 'Inicio'    },
  { to: '/tutor/horario',   icon: <Clock size={18} />,           label: 'Horario'   },
  { to: '/tutor/boleta',    icon: <BookOpen size={18} />,        label: 'Boleta'    },
  { to: '/tutor/reportes',  icon: <ClipboardList size={18} />,   label: 'Reportes'  },
  { to: '/tutor/avisos',    icon: <Bell size={18} />,            label: 'Avisos'    },
  { to: '/tutor/contacto',  icon: <Phone size={18} />,           label: 'Contacto'  },
];

const BREADCRUMBS = {
  '/tutor/inicio':   'Inicio',
  '/tutor/horario':  'Horario',
  '/tutor/boleta':   'Boleta Digital',
  '/tutor/reportes': 'Reportes',
  '/tutor/avisos':   'Avisos',
  '/tutor/contacto': 'Contacto',
};

export default function TutorLayout() {
  const { pathname } = useLocation();
  const breadcrumb   = BREADCRUMBS[pathname] || 'Tutor';

  return (
    <TutorProvider>
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
    </TutorProvider>
  );
}
