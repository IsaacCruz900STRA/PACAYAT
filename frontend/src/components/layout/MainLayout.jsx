import { Outlet } from 'react-router-dom';
import { Toast } from '../ui/Toast';
import HelpFAB   from '../ui/HelpFAB';

export default function MainLayout({ sidebar, navbar }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {sidebar}
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {navbar}
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>
      <Toast />
      <HelpFAB />
    </div>
  );
}
