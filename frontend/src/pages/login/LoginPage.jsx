import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUsuariosPorRol } from '../../api/auth.api';

const ROLES = [
  { value: 'ADMIN',           label: 'Administrador' },
  { value: 'DIRECTIVO',       label: 'Directivo' },
  { value: 'DOCENTE',         label: 'Docente' },
  { value: 'PREFECTO',        label: 'Prefecto' },
  { value: 'SECRETARIA',      label: 'Secretaría' },
  { value: 'CONTROL_ESCOLAR', label: 'Control Escolar' },
  { value: 'TUTOR',           label: 'Tutor' },
];

const ROLE_ROUTES = {
  ADMIN:           '/admin/dashboard',
  DIRECTIVO:       '/directivo/dashboard',
  DOCENTE:         '/docente/dashboard',
  PREFECTO:        '/prefecto/dashboard',
  SECRETARIA:      '/secretaria/dashboard',
  CONTROL_ESCOLAR: '/control-escolar/dashboard',
  TUTOR:           '/tutor/dashboard',
};

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [rol,       setRol]       = useState('');
  const [usuarios,  setUsuarios]  = useState([]);
  const [username,  setUsername]  = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [error,     setError]     = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting,   setSubmitting]   = useState(false);

  // Redirigir si ya hay sesión
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(ROLE_ROUTES[user.rol] || '/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Cargar usuarios cuando cambia el rol
  const handleRolChange = async (e) => {
    const newRol = e.target.value;
    setRol(newRol);
    setUsername('');
    setError('');
    if (!newRol) { setUsuarios([]); return; }
    setLoadingUsers(true);
    try {
      const { data } = await getUsuariosPorRol(newRol);
      setUsuarios(data);
    } catch {
      setUsuarios([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async () => {
    if (!rol)      { setError('Selecciona tu rol.'); return; }
    if (!username) { setError('Selecciona tu usuario.'); return; }
    if (!password) { setError('Ingresa tu contraseña.'); return; }

    setSubmitting(true);
    setError('');
    try {
      const loggedUser = await login(username, password, rol);
      navigate(ROLE_ROUTES[loggedUser.rol] || '/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales incorrectas. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Estilos ──────────────────────────────────────────────────────────────
  const bgStyle = {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(160deg, #c8e6c9 0%, #a5d6a7 40%, #81c784 100%)',
    position: 'relative', overflow: 'hidden',
  };
  const cardStyle = {
    background: '#fff', borderRadius: 18, padding: '2.5rem 2rem',
    width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    position: 'relative', zIndex: 1,
  };
  const labelStyle = { fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 8 };
  const selectStyle = {
    width: '100%', padding: '14px 43px 14px 16px', appearance: 'none',
    border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
    fontSize: 17, outline: 'none', cursor: 'pointer', background: '#fff',
  };
  const inputWrap = { position: 'relative' };
  const inputStyle = {
    width: '100%', padding: '14px 43px 14px 17px', border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)', fontSize: 16, outline: 'none',
  };

  return (
    <div style={bgStyle}>
      {/* Decoración de fondo */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 60%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Logo */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%', border: '3px solid var(--green-700)',
          background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1rem', fontSize: 22, fontWeight: 700, color: 'var(--green-800)',
        }}>ST</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--green-800)', marginBottom: 2 }}>
          Secundaria Técnica 177
        </div>
        <div style={{ fontSize: 16, color: 'var(--green-700)', fontWeight: 500, marginBottom: '1.75rem' }}>
          Sistema PACAYAT
        </div>

        {/* Card */}
        <div style={cardStyle}>
          <h2 style={{ textAlign: 'center', fontSize: 23, fontWeight: 700, marginBottom: '1.5rem' }}>
            Iniciar Sesión
          </h2>

          {/* Error */}
          {error && (
            <div style={{
              background: 'var(--red-50)', border: '1px solid var(--red-100)',
              borderRadius: 8, padding: '10px 14px', color: 'var(--red-600)',
              fontSize: 15, marginBottom: '1rem',
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Rol */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>
              Selecciona tu rol <span style={{ color: 'var(--red-500)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select value={rol} onChange={handleRolChange} style={selectStyle}
                onFocus={e => e.target.style.borderColor = 'var(--green-600)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}>
                <option value="">¿Quién eres?</option>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)', fontSize: 12 }}>▾</span>
            </div>
          </div>

          {/* Usuario — aparece cuando hay rol */}
          {rol && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>
                Selecciona tu usuario <span style={{ color: 'var(--red-500)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select value={username} onChange={e => { setUsername(e.target.value); setError(''); }}
                  style={selectStyle} disabled={loadingUsers}
                  onFocus={e => e.target.style.borderColor = 'var(--green-600)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}>
                  <option value="">{loadingUsers ? 'Cargando...' : 'Selecciona tu nombre'}</option>
                  {usuarios.map(u => (
                    <option key={u.id} value={u.username}>{u.nombre}</option>
                  ))}
                </select>
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)', fontSize: 12 }}>▾</span>
              </div>
            </div>
          )}

          {/* Contraseña — aparece cuando hay usuario */}
          {username && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>
                Contraseña <span style={{ color: 'var(--red-500)' }}>*</span>
              </label>
              <div style={inputWrap}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="••••••"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--green-600)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)' }}>
                  {showPass ? '👁' : '👁'}
                </button>
              </div>
            </div>
          )}

          {/* Botón ingresar */}
          {username && (
            <button onClick={handleSubmit} disabled={submitting} style={{
              width: '100%', padding: 12, borderRadius: 'var(--radius)', border: 'none',
              background: submitting ? 'var(--green-600)' : 'var(--green-700)',
              color: '#fff', fontSize: 18, fontWeight: 600,
              cursor: submitting ? 'wait' : 'pointer', transition: 'background var(--transition)',
              fontFamily: 'inherit',
            }}>
              {submitting ? 'Verificando...' : 'Ingresar'}
            </button>
          )}
        </div>

        <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginTop: '1.5rem' }}>
          © 2026 Secundaria Técnica 177 — Sistema PACAYAT
        </p>
      </div>

      {/* Help FAB */}
      <button style={{
        position: 'fixed', bottom: 24, right: 24, width: 44, height: 44,
        borderRadius: '50%', background: '#374151', color: '#fff', border: 'none',
        fontSize: 18, fontWeight: 700, cursor: 'pointer',
        boxShadow: 'var(--shadow-md)', zIndex: 300,
      }}>?</button>
    </div>
  );
}
