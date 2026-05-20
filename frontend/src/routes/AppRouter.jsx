import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Auth
import LoginPage from '../pages/login/LoginPage';

// Admin
import AdminLayout           from '../layouts/AdminLayout';
import AdminDashboard        from '../pages/admin/Dashboard';
import AdminAlumnos          from '../pages/admin/ListadoAlumnos';
import AdminPersonal         from '../pages/admin/ListadoPersonal';
import AdminPeriodos         from '../pages/admin/ConfigurarPeriodos';
import AdminAvisos           from '../pages/admin/GestionAvisos';
import AdminHorarios         from '../pages/admin/Horarios';
import AdminConfig           from '../pages/admin/Configuracion';
import AdminExpedienteAlumno from '../pages/admin/ExpedienteAlumno';

// Prefecto
import PrefectoLayout    from '../layouts/PrefectoLayout';
import PrefectoDashboard from '../pages/prefecto/Dashboard';
import PrefectoAlumnos   from '../pages/prefecto/Alumnos';
import PrefectoHorarios  from '../pages/prefecto/Horarios';
import PrefectoReportes  from '../pages/prefecto/Reportes';
import PrefectoAvisos    from '../pages/prefecto/Avisos';

// Docente
import DocenteLayout         from '../layouts/DocenteLayout';
import DocenteDashboard      from '../pages/docente/Dashboard';
import DocenteHorario        from '../pages/docente/Horario';
import DocenteCalificaciones from '../pages/docente/Calificaciones';
import DocenteAvisos         from '../pages/docente/Avisos';

// Control Escolar
import ControlEscolarLayout         from '../layouts/ControlEscolarLayout';
import ControlEscolarDashboard      from '../pages/control-escolar/Dashboard';
import ControlEscolarCalificaciones from '../pages/control-escolar/Calificaciones';
import ControlEscolarGrupos         from '../pages/control-escolar/Grupos';
import ControlEscolarAsignaciones   from '../pages/control-escolar/Asignaciones';
import ControlEscolarReportes       from '../pages/control-escolar/Reportes';
import ControlEscolarPeriodos       from '../pages/control-escolar/Periodos';
import ControlEscolarAvisos         from '../pages/control-escolar/Avisos';

// Secretaría
import SecretariaLayout     from '../layouts/SecretariaLayout';
import SecretariaDashboard  from '../pages/secretaria/Dashboard';
import SecretariaAlumnos    from '../pages/secretaria/GestionAlumnos';
import SecretariaTutores    from '../pages/secretaria/GestionTutores';
import SecretariaGrupos     from '../pages/secretaria/GestionGrupos';
import SecretariaDocumentos from '../pages/secretaria/Documentos';
import SecretariaAvisos     from '../pages/secretaria/Avisos';
import SecretariaReportes   from '../pages/secretaria/Reportes';

// Tutor
import TutorLayout   from '../layouts/TutorLayout';
import TutorInicio   from '../pages/tutor/Inicio';
import TutorHorario  from '../pages/tutor/Horario';
import TutorBoleta   from '../pages/tutor/Boleta';
import TutorReportes from '../pages/tutor/Reportes';
import TutorContacto from '../pages/tutor/Contacto';
import TutorAvisos   from '../pages/tutor/Avisos';

//Directivo
import DirectivoLayout       from '../layouts/DirectivoLayout';
import DirectivoDashboard    from '../pages/directivo/Dashboard';
import DirectivoAlumnos      from '../pages/directivo/Alumnos';
import DirectivoPersonal     from '../pages/directivo/Personal';
import DirectivoHorarios     from '../pages/directivo/Horarios';
import DirectivoReportes     from '../pages/directivo/Reportes';
import DirectivoEstadisticas from '../pages/directivo/Estadisticas';
import DirectivoAvisos       from '../pages/directivo/Avisos';

//
import RecuperarPassword from '../pages/login/RecuperarPassword';



// ── Placeholder con logout ────────────────────────────────────
function EnConstruccion({ title = 'En construcción', message = 'Esta sección estará disponible próximamente.' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', padding: '2rem', color: 'var(--text-secondary)' }}>
      {user && (
        <button type="button" onClick={handleLogout} style={{
          position: 'fixed', top: 20, right: 24,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 16px', borderRadius: 8,
          border: '1px solid var(--border)', background: '#fff',
          color: 'var(--red-600)', fontSize: 14, fontWeight: 600,
          boxShadow: 'var(--shadow-sm)', zIndex: 20, cursor: 'pointer',
        }}>
          <span aria-hidden="true">→</span> Cerrar sesión
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

// ── Redirección según rol ─────────────────────────────────────
function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const routes = {
    ADMIN:           '/admin/dashboard',
    DIRECTIVO:       '/directivo/dashboard',
    DOCENTE:         '/docente/dashboard',
    PREFECTO:        '/prefecto/dashboard',
    SECRETARIA:      '/secretaria/dashboard',
    CONTROL_ESCOLAR: '/control-escolar/dashboard',
    TUTOR:           '/tutor/inicio',   // ← corregido
  };
  return <Navigate to={routes[user.rol] || '/login'} replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"      element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
<Route path="/recuperar-password" element={<RecuperarPassword />} />

        {/* ── ADMIN ──────────────────────────────────────────── */}
        <Route element={<ProtectedRoute rolesPermitidos={['ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"   element={<AdminDashboard />} />
            <Route path="alumnos"     element={<AdminAlumnos />} />
            <Route path="alumnos/:id" element={<AdminExpedienteAlumno />} />
            <Route path="personal"    element={<AdminPersonal />} />
            <Route path="periodos"    element={<AdminPeriodos />} />
            <Route path="avisos"      element={<AdminAvisos />} />
            <Route path="horarios"    element={<AdminHorarios />} />
            <Route path="recuperacion-contraseñas" element={<EnConstruccion title="Recuperación de contraseñas" message="Aquí podrás gestionar las solicitudes de recuperación de contraseña de los usuarios." />} />
            <Route path="config"      element={<AdminConfig />} />
          </Route>
        </Route>

        {/* ── DOCENTE ────────────────────────────────────────── */}
        <Route element={<ProtectedRoute rolesPermitidos={['DOCENTE']} />}>
          <Route path="/docente" element={<DocenteLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"      element={<DocenteDashboard />} />
            <Route path="horario"        element={<DocenteHorario />} />
            <Route path="calificaciones" element={<DocenteCalificaciones />} />
            <Route path="avisos"         element={<DocenteAvisos />} />
          </Route>
        </Route>

        {/* ── PREFECTO ───────────────────────────────────────── */}
        <Route element={<ProtectedRoute rolesPermitidos={['PREFECTO']} />}>
          <Route path="/prefecto" element={<PrefectoLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<PrefectoDashboard />} />
            <Route path="alumnos"   element={<PrefectoAlumnos />} />
            <Route path="horarios"  element={<PrefectoHorarios />} />
            <Route path="reportes"  element={<PrefectoReportes />} />
            <Route path="avisos"    element={<PrefectoAvisos />} />
          </Route>
        </Route>

        {/* ── CONTROL ESCOLAR ────────────────────────────────── */}
        <Route element={<ProtectedRoute rolesPermitidos={['CONTROL_ESCOLAR']} />}>
          <Route path="/control-escolar" element={<ControlEscolarLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"      element={<ControlEscolarDashboard />} />
            <Route path="calificaciones" element={<ControlEscolarCalificaciones />} />
            <Route path="grupos"         element={<ControlEscolarGrupos />} />
            <Route path="asignaciones"   element={<ControlEscolarAsignaciones />} />
            <Route path="reportes"       element={<ControlEscolarReportes />} />
            <Route path="periodos"       element={<ControlEscolarPeriodos />} />
            <Route path="avisos"         element={<ControlEscolarAvisos />}   />
          </Route>
        </Route>

        {/* ── SECRETARÍA ─────────────────────────────────────── */}
        <Route element={<ProtectedRoute rolesPermitidos={['SECRETARIA', 'ADMIN']} />}>
          <Route path="/secretaria" element={<SecretariaLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"  element={<SecretariaDashboard />}  />
            <Route path="alumnos"    element={<SecretariaAlumnos />}    />
            <Route path="grupos"     element={<SecretariaGrupos />}     />
            <Route path="documentos" element={<SecretariaDocumentos />} />
            <Route path="avisos"     element={<SecretariaAvisos />}     />
            <Route path="reportes"   element={<SecretariaReportes />}   />
          </Route>
        </Route>

        {/* ── TUTOR ──────────────────────────────────────────── */}
        <Route element={<ProtectedRoute rolesPermitidos={['TUTOR']} />}>
          <Route path="/tutor" element={<TutorLayout />}>
            <Route index element={<Navigate to="inicio" replace />} />
            <Route path="inicio"   element={<TutorInicio />}   />
            <Route path="horario"  element={<TutorHorario />}  />
            <Route path="boleta"   element={<TutorBoleta />}   />
            <Route path="reportes" element={<TutorReportes />} />
            <Route path="avisos"   element={<TutorAvisos />}   />
            <Route path="contacto" element={<TutorContacto />} />
          </Route>
        </Route>

        {/* ── DIRECTIVO ──────────────────────────────────────── */}
        <Route element={<ProtectedRoute rolesPermitidos={['DIRECTIVO']} />}>
          <Route element={<ProtectedRoute rolesPermitidos={['DIRECTIVO', 'ADMIN']} />}>
  <Route path="/directivo" element={<DirectivoLayout />}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard"    element={<DirectivoDashboard />}    />
    <Route path="alumnos"      element={<DirectivoAlumnos />}      />
    <Route path="personal"     element={<DirectivoPersonal />}     />
    <Route path="horarios"     element={<DirectivoHorarios />}     />
    <Route path="reportes"     element={<DirectivoReportes />}     />
    <Route path="estadisticas" element={<DirectivoEstadisticas />} />
    <Route path="avisos"       element={<DirectivoAvisos />}       />
  </Route>
</Route>
        </Route>

        {/* ── PÁGINAS DE ERROR ───────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/no-autorizado" element={<EnConstruccion title="Sin autorización" message="No tienes permisos para acceder a esta sección." />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}