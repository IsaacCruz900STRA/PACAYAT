// src/components/tutor/SelectorHijo.jsx
// Tabs de selección de alumno — se renderiza en el Layout del tutor.
import { useTutor } from '../../context/TutorContext';

export default function SelectorHijo() {
  const { hijos, hijoActual, seleccionarHijo, loadingHijos } = useTutor();

  if (loadingHijos || hijos.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: 8, padding: '0 2rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
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
            {h.nombre.split(' ')[0]}   {/* Muestra solo el primer nombre */}
          </button>
        );
      })}
    </div>
  );
}
