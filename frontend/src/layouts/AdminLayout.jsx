import { useLocation, useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, User, Calendar, Bell, Clock, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar  from '../components/layout/Sidebar';
import Navbar   from '../components/layout/Navbar';
import { Toast } from '../components/ui/Toast';
import HelpFAB  from '../components/ui/HelpFAB';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'Inicio' },
  { to: '/admin/alumnos',   icon: <Users size={18} />,           label: 'Alumnos' },
  { to: '/admin/personal',  icon: <User size={18} />,            label: 'Personal' },
  { to: '/admin/periodos',  icon: <Calendar size={18} />,        label: 'Configurar Periodos' },
  { to: '/admin/avisos',    icon: <Bell size={18} />,            label: 'Avisos' },
  { to: '/admin/horarios',  icon: <Clock size={18} />,           label: 'Horarios' },
  { to: '/admin/config',    icon: <Settings size={18} />,        label: 'Configuración' },
];

const BREADCRUMBS = {
  '/admin/dashboard':  'Inicio',
  '/admin/alumnos':    'Alumnos',
  '/admin/personal':   'Personal',
  '/admin/periodos':   'Configurar Periodos',
  '/admin/avisos':    'Avisos',
  '/admin/horarios':  'Horarios',

  '/admin/config':     'Configuración',
};

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const breadcrumb = BREADCRUMBS[pathname] || 'Admin';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar navItems={NAV_ITEMS} />
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar breadcrumb={breadcrumb} />
        <main style={{ flex: 1, padding: 0 }}>
          <Outlet />
        </main>
      </div>
      <Toast />
      <HelpFAB />
    </div>
  );
}
