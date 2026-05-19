import { useState } from 'react';
import Button from '../ui/Button';
import { changePassword as apiChangePassword } from '../../api/auth.api';

export default function ForcedChangePassword({ open, onDone }) {
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (pass.trim().length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
    if (pass !== pass2) return setError('Las contraseñas no coinciden');
    setLoading(true);
    try {
      const { data } = await apiChangePassword(pass);
      // Si el backend devuelve el usuario actualizado, pásalo al callback para que actualice el almacenamiento
      if (data?.usuario) {
        onDone?.(data.usuario);
      } else {
        onDone?.();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(17,24,39,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={submit} style={{ width: 420, background: '#fff', padding: 20, borderRadius: 10 }}>
        <h3 style={{ marginTop: 0 }}>Cambio de contraseña requerido</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Por seguridad debes cambiar tu contraseña antes de continuar.</p>
        <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
          <input type="password" placeholder="Nueva contraseña" value={pass} onChange={e => setPass(e.target.value)} style={{ padding: '9px 10px', border: '1px solid var(--border)', borderRadius: 6 }} />
          <input type="password" placeholder="Confirmar nueva contraseña" value={pass2} onChange={e => setPass2(e.target.value)} style={{ padding: '9px 10px', border: '1px solid var(--border)', borderRadius: 6 }} />
          {error && <div style={{ color: '#dc2626', fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button type="submit" disabled={loading}>{loading ? 'Cambiando...' : 'Cambiar contraseña'}</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
