import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUsuariosPorRol } from '../../api/auth.api';

const ROLES = [
  { value: 'ADMIN',           label: 'Administrador'  },
  { value: 'DIRECTIVO',       label: 'Directivo'      },
  { value: 'DOCENTE',         label: 'Docente'        },
  { value: 'PREFECTO',        label: 'Prefecto'       },
  { value: 'SECRETARIA',      label: 'Secretaría'     },
  { value: 'CONTROL_ESCOLAR', label: 'Control Escolar'},
  { value: 'TUTOR',           label: 'Tutor'          },
];

const ROLE_ROUTES = {
  ADMIN:           '/admin/dashboard',
  DIRECTIVO:       '/directivo/dashboard',
  DOCENTE:         '/docente/dashboard',
  PREFECTO:        '/prefecto/dashboard',
  SECRETARIA:      '/secretaria/dashboard',
  CONTROL_ESCOLAR: '/control-escolar/dashboard',
  TUTOR:           '/tutor/inicio',
};

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [rol,            setRol]            = useState('');
  const [usuarios,       setUsuarios]       = useState([]);
  const [username,       setUsername]       = useState('');
  const [password,       setPassword]       = useState('');
  const [showPass,       setShowPass]       = useState(false);
  const [error,          setError]          = useState('');
  const [loadingUsers,   setLoadingUsers]   = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [blocked,        setBlocked]        = useState(false);
  const [blockedMessage, setBlockedMessage] = useState('');

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
    if (!rol)      { setError('Selecciona tu rol.');      return; }
    if (!username) { setError('Selecciona tu usuario.');  return; }
    if (!password) { setError('Ingresa tu contraseña.'); return; }

    setSubmitting(true);
    setError('');
    try {
      const loggedUser = await login(username, password, rol);
      navigate(ROLE_ROUTES[loggedUser.rol] || '/', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Credenciales incorrectas. Intenta de nuevo.';
      if (err.response?.status === 423) {
        setBlocked(true);
        setBlockedMessage(message);
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Estilos ───────────────────────────────────────────────
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
  const labelStyle = {
    fontSize: 14, fontWeight: 600, color: 'var(--text-primary)',
    display: 'block', marginBottom: 6,
  };
  const selectStyle = {
    width: '100%', padding: '12px 36px 12px 14px', appearance: 'none',
    border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
    fontSize: 14, outline: 'none', cursor: 'pointer', background: '#fff',
  };
  const inputStyle = {
    width: '100%', padding: '12px 40px 12px 14px',
    border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
    fontSize: 14, outline: 'none',
  };

  return (
    <div style={bgStyle}>
      {/* Fondo decorativo */}
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
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--green-800)', marginBottom: 2 }}>
          Secundaria Técnica 177
        </div>
        <div style={{ fontSize: 14, color: 'var(--green-700)', fontWeight: 500, marginBottom: '1.75rem' }}>
          Sistema PACAYAT
        </div>

        {/* Card */}
        <div style={cardStyle}>
          {blocked ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', border: '3px solid var(--green-700)',
                background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 700, color: 'var(--green-800)',
              }}>ST</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--green-800)' }}>Secundaria Técnica 177</div>
                <div style={{ fontSize: 14, color: 'var(--green-700)', fontWeight: 500, marginTop: 4 }}>Sistema PACAYAT</div>
              </div>
              <div style={{ width: '100%', background: 'var(--red-50)', border: '1px solid var(--red-100)', borderRadius: 10, padding: 18, color: 'var(--red-600)', textAlign: 'center', fontSize: 15, lineHeight: 1.5 }}>
                {blockedMessage}
              </div>
            </div>
          ) : (
            <>
              <h2 style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, marginBottom: '1.5rem' }}>
                Iniciar Sesión
              </h2>

              {/* Error */}
              {error && (
                <div style={{
                  background: 'var(--red-50)', border: '1px solid var(--red-100)',
                  borderRadius: 8, padding: '10px 14px', color: 'var(--red-600)',
                  fontSize: 13, marginBottom: '1rem',
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

              {/* Usuario */}
              {rol && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>
                    Selecciona tu usuario <span style={{ color: 'var(--red-500)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select value={username}
                      onChange={e => { setUsername(e.target.value); setError(''); }}
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

              {/* Contraseña */}
              {username && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={labelStyle}>
                    Contraseña <span style={{ color: 'var(--red-500)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
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
                    <button type="button" onClick={() => setShowPass(s => !s)} style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 15, color: 'var(--text-muted)',
                    }}>
                      {showPass ? '👁' : '👁'}
                    </button>
                  </div>
                </div>
              )}

              {/* ¿Olvidaste tu contraseña? + Botón ingresar */}
              {username && (
                <>
                  {/* Enlace recuperar contraseña */}
                  <div style={{ textAlign: 'right', marginBottom: 12 }}>
                    <button
                      type="button"
                      onClick={() => navigate('/recuperar-password')}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--green-700)', fontSize: 13, fontWeight: 500,
                        fontFamily: 'inherit', padding: 0,
                      }}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>

                  {/* Botón ingresar */}
                  <button onClick={handleSubmit} disabled={submitting} style={{
                    width: '100%', padding: 12, borderRadius: 'var(--radius)', border: 'none',
                    background: submitting ? 'var(--green-600)' : 'var(--green-700)',
                    color: '#fff', fontSize: 15, fontWeight: 600,
                    cursor: submitting ? 'wait' : 'pointer',
                    fontFamily: 'inherit',
                  }}>
                    {submitting ? 'Verificando...' : 'Ingresar'}
                  </button>
                </>
              )}
            </>
          )}
        </div>

        <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginTop: '1.5rem' }}>
          © 2026 Secundaria Técnica 177 — Sistema PACAYAT
        </p>
      </div>

      {/* Help FAB */}
      <button
        title="Plataforma de Control Académico y Alertas Tempranas"
        aria-label="Plataforma de Control Académico y Alertas Tempranas"
        style={{
          position: 'fixed', bottom: 24, right: 24, width: 44, height: 44,
          borderRadius: '50%', background: '#374151', color: '#fff', border: 'none',
          fontSize: 18, fontWeight: 700, cursor: 'pointer',
          boxShadow: 'var(--shadow-md)', zIndex: 300,
        }}
      >?
      </button>
    </div>
  );
}