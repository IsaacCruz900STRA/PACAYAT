// src/pages/docente/Avisos.jsx
// Nota: Esta vista no es accesible desde el sidebar.
// Los avisos de evaluación se muestran directamente en el Dashboard (Inicio).
import { Navigate } from 'react-router-dom';

export default function AvisosDocente() {
  return <Navigate to="/docente/dashboard" replace />;
}
