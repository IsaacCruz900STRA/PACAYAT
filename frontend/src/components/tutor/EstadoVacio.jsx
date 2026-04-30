// src/components/tutor/EstadoVacio.jsx
// Muestra un mensaje cuando no hay hijos registrados o hay un error.
import Card from '../ui/Card';

export default function EstadoVacio({ error, loading, titulo, descripcion, icon = '📭' }) {
  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
        <p>Cargando información...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card style={{ margin: '2rem', padding: '2.5rem', textAlign: 'center', border: '1px solid var(--red-100)', background: 'var(--red-50)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--red-600)', marginBottom: 8 }}>
          {titulo || 'Sin alumnos registrados'}
        </h3>
        <p style={{ fontSize: 14, color: 'var(--red-600)', lineHeight: 1.6 }}>
          {error || descripcion || 'No hay alumnos vinculados a este tutor.'}
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
          Si crees que esto es un error, contacta a la secretaría de la escuela.
        </p>
      </Card>
    );
  }

  return (
    <Card style={{ margin: '2rem', padding: '2.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>{icon}</div>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
        {titulo || 'Sin datos'}
      </h3>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
        {descripcion || 'No hay información disponible.'}
      </p>
    </Card>
  );
}
