import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, width = 520 }) {
  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const overlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
  };
  const boxStyle = {
    background: '#fff', borderRadius: 'var(--radius-xl)',
    padding: '2rem', width: width, maxWidth: '95vw',
    maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)',
  };
  const headerStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '1.5rem',
  };

  return (
    <div style={overlayStyle} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={boxStyle}>
        <div style={headerStyle}>
          <span style={{ fontSize: 20, fontWeight: 700 }}>{title}</span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 22,
            cursor: 'pointer', color: 'var(--text-secondary)', lineHeight: 1,
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
