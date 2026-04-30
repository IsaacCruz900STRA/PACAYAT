// src/components/tutor/SelectorHijo.jsx
// Tabs de selección de hijo. Se usa al inicio de cada página del tutor.
import { useTutor } from '../../context/TutorContext';

export default function SelectorHijo() {
  const { hijos, hijoActual, seleccionarHijo, loading } = useTutor();

  if (loading || hijos.length <= 1) return null; // No mostrar si solo hay 1 hijo

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
      {hijos.map(h => {
        const active = hijoActual?.id === h.id;
        return (
          <button
            key={h.id}
            onClick={() => seleccionarHijo(h)}
            style={{
              padding: '8px 22px',
              borderRadius: 'var(--radius)',
              fontSize: 15,
              fontWeight: active ? 700 : 500,
              border: '2px solid',
              borderColor: active ? 'var(--green-700)' : 'var(--border)',
              background:  active ? 'var(--green-700)' : '#fff',
              color:       active ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all var(--transition)',
            }}
          >
            {h.nombre.split(' ')[0]}
          </button>
        );
      })}
    </div>
  );
}
