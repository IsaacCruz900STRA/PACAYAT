import { useEffect, useState } from 'react';
import { Check, X, Info } from 'lucide-react';

let toastFn = null;

export function showToast(message, type = 'success') {
  if (toastFn) toastFn({ message, type });
}

export function Toast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    toastFn = setToast;
    return () => { toastFn = null; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  const colors = {
    success: { bg: '#1f2937', accent: '#22c55e' },
    error:   { bg: '#7f1d1d', accent: '#f87171' },
    info:    { bg: '#1e3a5f', accent: '#60a5fa' },
  };
  const { bg, accent } = colors[toast.type] || colors.success;

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 24, zIndex: 999,
      background: bg, color: '#fff', padding: '12px 20px',
      borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 500,
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: 'var(--shadow-lg)',
      animation: 'slideUp 0.25s ease',
    }}>
      <span style={{ color: accent, fontSize: 16, display: 'flex', alignItems: 'center' }}>
        {toast.type === 'success' ? <Check size={14} /> : toast.type === 'error' ? <X size={14} /> : <Info size={14} />}
      </span>
      {toast.message}
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
