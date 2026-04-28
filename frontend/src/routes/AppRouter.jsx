import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import ProtectedRoute from './ProtectedRoute';

// Auth
import LoginPage from '../pages/login/LoginPage';

// Admin
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminAlumnos from '../pages/admin/ListadoAlumnos';
import AdminPersonal from '../pages/admin/ListadoPersonal';
import AdminPeriodos from '../pages/admin/ConfigurarPeriodos';
import AdminAvisos from '../pages/admin/GestionAvisos';
import AdminAsistencia from '../pages/admin/AsistenciaGeneral';
import AdminConfig from '../pages/admin/Configuracion';

// Docente
import DocenteLayout from '../layouts/DocenteLayout';
import DocenteDashboard from '../pages/docente/Dashboard';
import DocenteHorario from '../pages/docente/Horario';
import DocenteCalificaciones from '../pages/docente/Calificaciones';
import DocenteAvisos from '../pages/docente/Avisos';

const EnConstruccion = () => (
  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
    <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
    <h2 style={{ marginBottom: 8 }}>En construcción</h2>
    <p>Esta sección estará disponible próximamente.</p>
  </div>
);

function RootRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const routes = {
    ADMIN: '/admin/dashboard',
    DIRECTIVO: '/directivo/dashboard',
    DOCENTE: '/docente/dashboard',
    PREFECTO: '/prefecto/dashboard',
    SECRETARIA: '/secretaria/dashboard',
    CONTROL_ESCOLAR: '/control-escolar/dashboard',
    TUTOR: '/tutor/dashboard',
  };

  return <Navigate to={routes[user.rol] || '/login'} replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route path="/login" element={<LoginPage />} />

        {/* ADMIN */}
        <Route element={<ProtectedRoute rolesPermitidos={['ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="alumnos" element={<AdminAlumnos />} />
            <Route path="personal" element={<AdminPersonal />} />
            <Route path="periodos" element={<AdminPeriodos />} />
            <Route path="avisos" element={<AdminAvisos />} />
            <Route path="asistencia" element={<AdminAsistencia />} />
            <Route path="config" element={<AdminConfig />} />
          </Route>
        </Route>

        {/* DOCENTE */}
        <Route element={<ProtectedRoute rolesPermitidos={['DOCENTE']} />}>
          <Route path="/docente" element={<DocenteLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DocenteDashboard />} />
            <Route path="horario" element={<DocenteHorario />} />
            <Route path="calificaciones" element={<DocenteCalificaciones />} />
            <Route path="avisos" element={<DocenteAvisos />} />
          </Route>
        </Route>

        {/* RESTO DE ROLES */}
        <Route path="/directivo/*" element={<EnConstruccion />} />
        <Route path="/prefecto/*" element={<EnConstruccion />} />
        <Route path="/secretaria/*" element={<EnConstruccion />} />
        <Route path="/control-escolar/*" element={<EnConstruccion />} />
        <Route path="/tutor/*" element={<EnConstruccion />} />
        <Route path="/no-autorizado" element={<EnConstruccion />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}