import { Navigate, Outlet } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// rolesPermitidos: array de roles que pueden acceder, ej. ['ADMIN', 'DIRECTIVO']
// Si es vacío, solo requiere autenticación
export default function ProtectedRoute({ rolesPermitidos = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12, display: 'flex', justifyContent: 'center' }}><Leaf size={32} /></div>
          <p style={{ color: 'var(--text-secondary)' }}>Cargando PACAYAT...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(user.rol)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return <Outlet />;
}
