import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import ProtectedRoute from './ProtectedRoute';

// Auth
import LoginPage from '../pages/login/LoginPage';

// Admin
import AdminLayout    from '../layouts/AdminLayout';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminAlumnos   from '../pages/admin/ListadoAlumnos';
import AdminPersonal  from '../pages/admin/ListadoPersonal';
import AdminPeriodos  from '../pages/admin/ConfigurarPeriodos';
import AdminAvisos    from '../pages/admin/GestionAvisos';
import AdminHorarios  from '../pages/admin/Horarios';
import AdminConfig    from '../pages/admin/Configuracion';
import AdminExpedienteAlumno from '../pages/admin/ExpedienteAlumno';

// Placeholders futuros
function EnConstruccion({ title = 'En construcción', message = 'Esta sección estará disponible próximamente.' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', padding: '2rem', color: 'var(--text-secondary)' }}>
      {user && (
        <button
          type="button"
          onClick={handleLogout}
          style={{
            position: 'fixed', top: 20, right: 24,
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 8,
            border: '1px solid var(--border)', background: '#fff',
            color: 'var(--red-600)', fontSize: 14, fontWeight: 600,
            boxShadow: 'var(--shadow-sm)', zIndex: 20,
          }}
        >
          <span aria-hidden="true">→</span>
          Cerrar sesión
        </button>
      )}

      <div style={{ paddingTop: '6rem', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
        <h2 style={{ marginBottom: 8 }}>{title}</h2>
        <p>{message}</p>
        {user && (
          <p style={{ marginTop: 16, fontSize: 13 }}>
            Sesión activa: <strong>{user.nombre}</strong> · {user.rol}
          </p>
        )}
      </div>
    </div>
  );
}

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
        {/* Raíz → redirige según rol */}
        <Route path="/" element={<RootRedirect />} />

        {/* Login público */}
        <Route path="/login" element={<LoginPage />} />

        {/* ── ADMIN ─────────────────────────────── */}
        <Route element={<ProtectedRoute rolesPermitidos={['ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"  element={<AdminDashboard />} />
            <Route path="alumnos"    element={<AdminAlumnos />} />
            <Route path="alumnos/:id" element={<AdminExpedienteAlumno />} />
            <Route path="personal"   element={<AdminPersonal />} />
            <Route path="periodos"   element={<AdminPeriodos />} />
            <Route path="avisos"    element={<AdminAvisos />} />
            <Route path="horarios"  element={<AdminHorarios />} />
            <Route path="config"     element={<AdminConfig />} />
          </Route>
        </Route>

        {/* ── DOCENTE ───────────────────────────── */}
        <Route element={<ProtectedRoute rolesPermitidos={['DOCENTE']} />}>
          <Route path="/docente/*" element={<EnConstruccion />} />
        </Route>

        {/* Resto de roles — En construcción */}
        <Route element={<ProtectedRoute rolesPermitidos={['DIRECTIVO']} />}>
          <Route path="/directivo/*" element={<EnConstruccion />} />
        </Route>
        <Route element={<ProtectedRoute rolesPermitidos={['PREFECTO']} />}>
          <Route path="/prefecto/*" element={<EnConstruccion />} />
        </Route>
        <Route element={<ProtectedRoute rolesPermitidos={['SECRETARIA']} />}>
          <Route path="/secretaria/*" element={<EnConstruccion />} />
        </Route>
        <Route element={<ProtectedRoute rolesPermitidos={['CONTROL_ESCOLAR']} />}>
          <Route path="/control-escolar/*" element={<EnConstruccion />} />
        </Route>
        <Route element={<ProtectedRoute rolesPermitidos={['TUTOR']} />}>
          <Route path="/tutor/*" element={<EnConstruccion />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route
            path="/no-autorizado"
            element={<EnConstruccion title="Sin autorización" message="No tienes permisos para acceder a esta sección." />}
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
