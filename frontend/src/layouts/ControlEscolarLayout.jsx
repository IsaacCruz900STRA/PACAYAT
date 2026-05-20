// src/layouts/ControlEscolarLayout.jsx
import { useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, CalendarDays, ClipboardList, CalendarCheck, Bell } from 'lucide-react';
import Sidebar   from '../components/layout/Sidebar';
import Navbar    from '../components/layout/Navbar';
import { Toast } from '../components/ui/Toast';
import HelpFAB   from '../components/ui/HelpFAB';

const NAV_ITEMS = [
  { to: '/control-escolar/dashboard',    icon: <LayoutDashboard size={18} />, label: 'Dashboard'              },
  { to: '/control-escolar/calificaciones', icon: <BookOpen size={18} />,      label: 'Calificaciones'         },
  { to: '/control-escolar/grupos',       icon: <Users size={18} />,           label: 'Grupos'                 },
  { to: '/control-escolar/asignaciones', icon: <CalendarDays size={18} />,    label: 'Asignaciones y Horarios'},
  { to: '/control-escolar/reportes',     icon: <ClipboardList size={18} />,   label: 'Reportes'               },
  { to: '/control-escolar/periodos',     icon: <CalendarCheck size={18} />,   label: 'Periodos de Evaluación' },
  { to: '/control-escolar/avisos',       icon: <Bell size={18} />,            label: 'Avisos'                 },
];

const BREADCRUMBS = {
  '/control-escolar/dashboard':     'Dashboard',
  '/control-escolar/calificaciones':'Calificaciones',
  '/control-escolar/grupos':        'Grupos',
  '/control-escolar/asignaciones':  'Asignaciones y Horarios',
  '/control-escolar/reportes':      'Reportes',
  '/control-escolar/periodos':      'Periodos de Evaluación',
  '/control-escolar/avisos':        'Avisos',

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
