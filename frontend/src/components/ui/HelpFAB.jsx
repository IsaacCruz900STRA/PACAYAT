import { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

export default function HelpFAB() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 398 }}
        />
      )}

      {open && (
        <div style={{
          position: 'fixed', bottom: 80, right: 24, zIndex: 399,
          width: 320, background: '#1f2937', color: '#f9fafb',
          borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <ShieldCheck size={15} color="#86efac" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#86efac', letterSpacing: 0.3 }}>
              Aviso de Privacidad · LFPDPPP
            </span>
          </div>
          <p style={{ fontSize: 12.5, lineHeight: 1.65, margin: '0 0 8px', color: '#e5e7eb' }}>
            Esta plataforma trata datos personales de alumnos, tutores y personal docente con base
            en los principios establecidos en la <strong style={{ color: '#fff' }}>Ley Federal de Protección
            de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong>.
          </p>
          <p style={{ fontSize: 12.5, lineHeight: 1.65, margin: 0, color: '#e5e7eb' }}>
            La información registrada en el Sistema PACAYAT se utiliza exclusivamente para fines
            educativos y administrativos de la Secundaria Técnica 177.
          </p>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 5, opacity: 0.5 }}>
            <Lock size={10} />
            <span style={{ fontSize: 10.5 }}>Secundaria Técnica 177 · Sistema PACAYAT</span>
          </div>
          {/* Flecha */}
          <div style={{
            position: 'absolute', bottom: -6, right: 19,
            width: 12, height: 12, background: '#1f2937',
            transform: 'rotate(45deg)', borderRadius: 2,
          }} />
        </div>
      )}

      <button
        onClick={() => setOpen(v => !v)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 400,
          width: 44, height: 44, borderRadius: '50%',
          background: open ? 'var(--green-700)' : '#374151',
          color: '#fff', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 700,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          transition: 'background 0.2s',
        }}
        aria-label="Aviso de privacidad"
        title="Aviso de privacidad"
      >
        ?
      </button>
    </>
  );
}
