import { useState } from 'react';
import { Lock } from 'lucide-react';

const HELP_TEXT = 'Esta página está regulada por normas que indican la protección de datos personales.';

export default function HelpFAB() {
  const [visible, setVisible] = useState(false);

  return (
    // El onMouseEnter/Leave está en el WRAPPER para que el tooltip no desaparezca al mover el mouse sobre él
    <div
      style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 400 }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {visible && (
        <div style={{
          position: 'absolute', bottom: 54, right: 0,
          width: 270, padding: '12px 14px',
          background: '#1f2937', color: '#f9fafb',
          borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          fontSize: 13, lineHeight: 1.6,
          pointerEvents: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ fontSize: 16, flexShrink: 0, display: 'flex', alignItems: 'center' }}><Lock size={16} /></span>
            <p style={{ margin: 0 }}>{HELP_TEXT}</p>
          </div>
          {/* Flecha apuntando al botón */}
          <div style={{
            position: 'absolute', bottom: -6, right: 19,
            width: 12, height: 12,
            background: '#1f2937',
            transform: 'rotate(45deg)',
            borderRadius: 2,
          }} />
        </div>
      )}

      <button
        onClick={() => setVisible(v => !v)}
        style={{
          width: 44, height: 44, borderRadius: '50%',
          background: visible ? 'var(--green-700)' : '#374151',
          color: '#fff', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 700,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          transition: 'background 0.2s',
        }}
        aria-label="Información de protección de datos"
        title="Aviso de privacidad"
      >
        ?
      </button>
    </div>
  );
}
