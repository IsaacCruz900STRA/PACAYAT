// src/pages/login/RecuperarPassword.jsx
//
// Flujo de 3 pasos:
//  Paso 1 — Ingresa tu correo institucional
//  Paso 2 — Ingresa el código de 6 dígitos enviado al correo
//  Paso 3 — Crea tu nueva contraseña
//
// TODO: reemplazar las funciones simuladas por llamadas reales a la API:
//   POST /api/auth/recuperar        { correo }
//   POST /api/auth/verificar-codigo { correo, codigo }
//   POST /api/auth/nueva-password   { correo, codigo, nuevaPassword }

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Helpers visuales ─────────────────────────────────────────
const bgStyle = {
  minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'linear-gradient(160deg, #c8e6c9 0%, #a5d6a7 40%, #81c784 100%)',
  position: 'relative', overflow: 'hidden', padding: '1rem',
};

const cardStyle = {
  background: '#fff', borderRadius: 18, padding: '2.5rem 2rem',
  width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  position: 'relative', zIndex: 1,
};

const inputStyle = {
  width: '100%', padding: '10px 14px',
  border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
  fontSize: 14, outline: 'none', fontFamily: 'inherit',
  transition: 'border-color 0.18s',
};

const btnPrimary = {
  width: '100%', padding: 12, borderRadius: 'var(--radius)', border: 'none',
  background: 'var(--green-700)', color: '#fff', fontSize: 15, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit', marginTop: 4,
};

const btnSecondary = {
  width: '100%', padding: '10px 12px', borderRadius: 'var(--radius)',
  border: '1.5px solid var(--border)', background: '#fff', fontSize: 14,
  fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--text-secondary)',
};

const labelStyle = {
  fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
  display: 'block', marginBottom: 5,
};

function ErrorMsg({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#991b1b', fontSize: 13, marginBottom: '1rem' }}>
      ⚠ {msg}
    </div>
  );
}

function SuccessMsg({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', color: '#14532d', fontSize: 13, marginBottom: '1rem' }}>
      ✓ {msg}
    </div>
  );
}

// ── Indicador de pasos ────────────────────────────────────────
function StepIndicator({ paso }) {
  const pasos = ['Correo', 'Código', 'Contraseña'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: '1.75rem' }}>
      {pasos.map((label, i) => {
        const num    = i + 1;
        const done   = paso > num;
        const active = paso === num;
        return (
          <div key={num} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Círculo */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: done ? 15 : 13, fontWeight: 700,
                background: done ? 'var(--green-700)' : active ? 'var(--green-700)' : '#e5e7eb',
                color: (done || active) ? '#fff' : 'var(--text-muted)',
                border: active ? '3px solid #bbf7d0' : 'none',
                transition: 'all 0.2s',
              }}>
                {done ? '✓' : num}
              </div>
              <span style={{ fontSize: 10, color: active ? 'var(--green-700)' : 'var(--text-muted)', fontWeight: active ? 600 : 400 }}>
                {label}
              </span>
            </div>
            {/* Línea */}
            {i < pasos.length - 1 && (
              <div style={{ width: 48, height: 2, background: paso > num ? 'var(--green-600)' : '#e5e7eb', margin: '0 4px', marginBottom: 18, transition: 'background 0.3s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PASO 1 — Ingresa tu correo
// ══════════════════════════════════════════════════════════════
function Paso1({ onNext }) {
  const [correo,  setCorreo]  = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleEnviar = async () => {
    setError('');
    if (!correo.trim()) { setError('Ingresa tu correo institucional.'); return; }
    if (!correo.includes('@')) { setError('Ingresa un correo válido.'); return; }

    setLoading(true);
    try {
      // TODO: await api.post('/auth/recuperar', { correo });
      await new Promise(r => setTimeout(r, 800)); // simular petición
      onNext(correo);
    } catch {
      setError('No encontramos una cuenta con ese correo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 style={{ textAlign: 'center', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
        Recuperar contraseña
      </h2>
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
        Ingresa tu correo institucional y te enviaremos un código de verificación.
      </p>

      <ErrorMsg msg={error} />

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={labelStyle}>
          Correo institucional <span style={{ color: 'var(--red-500)' }}>*</span>
        </label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: 'var(--text-muted)' }}>✉️</span>
          <input
            type="email"
            value={correo}
            onChange={e => { setCorreo(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleEnviar()}
            placeholder="tu.nombre@st177.edu.mx"
            style={{ ...inputStyle, paddingLeft: 36 }}
            onFocus={e => e.target.style.borderColor = 'var(--green-600)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
      </div>

      <button onClick={handleEnviar} disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}>
        {loading ? 'Enviando código...' : 'Enviar código de verificación'}
      </button>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// PASO 2 — Código de 6 dígitos
// ══════════════════════════════════════════════════════════════
function Paso2({ correo, onNext, onBack }) {
  const [codigo,   setCodigo]   = useState(['', '', '', '', '', '']);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [reenviado,setReenviado]= useState(false);

  const correoOculto = correo.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(b.length) + c);

  const handleInput = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const nuevo = [...codigo];
    nuevo[idx] = val;
    setCodigo(nuevo);
    setError('');
    // Auto-avanzar al siguiente
    if (val && idx < 5) {
      document.getElementById(`cod-${idx + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !codigo[idx] && idx > 0) {
      document.getElementById(`cod-${idx - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setCodigo(text.split(''));
      document.getElementById('cod-5')?.focus();
    }
    e.preventDefault();
  };

  const handleVerificar = async () => {
    const codigoStr = codigo.join('');
    if (codigoStr.length < 6) { setError('Ingresa el código completo de 6 dígitos.'); return; }

    setLoading(true);
    try {
      // TODO: await api.post('/auth/verificar-codigo', { correo, codigo: codigoStr });
      await new Promise(r => setTimeout(r, 700));
      onNext(codigoStr);
    } catch {
      setError('Código incorrecto o expirado. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const reenviar = async () => {
    // TODO: await api.post('/auth/recuperar', { correo });
    await new Promise(r => setTimeout(r, 500));
    setCodigo(['', '', '', '', '', '']);
    setReenviado(true);
    setTimeout(() => setReenviado(false), 4000);
  };

  return (
    <>
      <h2 style={{ textAlign: 'center', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
        Código de verificación
      </h2>
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
        Enviamos un código de 6 dígitos a<br />
        <strong style={{ color: 'var(--text-primary)' }}>{correoOculto}</strong>
      </p>

      <ErrorMsg msg={error} />
      <SuccessMsg msg={reenviado ? 'Código reenviado correctamente.' : ''} />

      {/* Inputs de código */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: '1.5rem' }} onPaste={handlePaste}>
        {codigo.map((d, i) => (
          <input
            key={i}
            id={`cod-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleInput(e.target.value, i)}
            onKeyDown={e => handleKeyDown(e, i)}
            style={{
              width: 48, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 700,
              border: `2px solid ${d ? 'var(--green-600)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)', outline: 'none', fontFamily: 'inherit',
              background: d ? 'var(--green-50)' : '#fff',
              transition: 'all 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--green-600)'}
            onBlur={e => e.target.style.borderColor = d ? 'var(--green-600)' : 'var(--border)'}
          />
        ))}
      </div>

      <button onClick={handleVerificar} disabled={loading} style={{ ...btnPrimary, marginBottom: 10, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}>
        {loading ? 'Verificando...' : 'Verificar código'}
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'inherit' }}>
          ← Cambiar correo
        </button>
        <button onClick={reenviar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green-700)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
          Reenviar código
        </button>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// PASO 3 — Nueva contraseña
// ══════════════════════════════════════════════════════════════
function Paso3({ correo, codigo, onExito }) {
  const [nueva,     setNueva]     = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [showNueva, setShowNueva] = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  // Validaciones en tiempo real
  const requisitos = [
    { label: 'Mínimo 8 caracteres',       ok: nueva.length >= 8 },
    { label: 'Al menos una mayúscula',     ok: /[A-Z]/.test(nueva) },
    { label: 'Al menos un número',         ok: /\d/.test(nueva) },
    { label: 'Las contraseñas coinciden',  ok: nueva && nueva === confirmar },
  ];
  const todoOk = requisitos.every(r => r.ok);

  const handleGuardar = async () => {
    if (!todoOk) { setError('Revisa los requisitos de la contraseña.'); return; }
    setLoading(true);
    try {
      // TODO: await api.post('/auth/nueva-password', { correo, codigo, nuevaPassword: nueva });
      await new Promise(r => setTimeout(r, 800));
      onExito();
    } catch {
      setError('Error al cambiar la contraseña. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const inputWrap = { position: 'relative', marginBottom: '1rem' };
  const eyeBtn = { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: 'var(--text-muted)' };

  return (
    <>
      <h2 style={{ textAlign: 'center', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
        Nueva contraseña
      </h2>
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Crea una contraseña segura para tu cuenta.
      </p>

      <ErrorMsg msg={error} />

      {/* Nueva contraseña */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>Nueva contraseña <span style={{ color: 'var(--red-500)' }}>*</span></label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: 'var(--text-muted)' }}>🔒</span>
          <input
            type={showNueva ? 'text' : 'password'}
            value={nueva}
            onChange={e => { setNueva(e.target.value); setError(''); }}
            placeholder="Mínimo 8 caracteres"
            style={{ ...inputStyle, paddingLeft: 36, paddingRight: 36 }}
            onFocus={e => e.target.style.borderColor = 'var(--green-600)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button type="button" onClick={() => setShowNueva(s => !s)} style={eyeBtn}>
            {showNueva ? '🙈' : '👁'}
          </button>
        </div>
      </div>

      {/* Confirmar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={labelStyle}>Confirmar contraseña <span style={{ color: 'var(--red-500)' }}>*</span></label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: 'var(--text-muted)' }}>🔒</span>
          <input
            type={showConf ? 'text' : 'password'}
            value={confirmar}
            onChange={e => { setConfirmar(e.target.value); setError(''); }}
            placeholder="Repite tu nueva contraseña"
            style={{ ...inputStyle, paddingLeft: 36, paddingRight: 36 }}
            onFocus={e => e.target.style.borderColor = 'var(--green-600)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button type="button" onClick={() => setShowConf(s => !s)} style={eyeBtn}>
            {showConf ? '🙈' : '👁'}
          </button>
        </div>
      </div>

      {/* Requisitos */}
      {nueva && (
        <div style={{ background: '#f9fafb', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: '1.25rem' }}>
          {requisitos.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < requisitos.length - 1 ? 6 : 0 }}>
              <span style={{ fontSize: 14, color: r.ok ? '#16a34a' : '#9ca3af' }}>{r.ok ? '✓' : '○'}</span>
              <span style={{ fontSize: 13, color: r.ok ? '#14532d' : 'var(--text-muted)', fontWeight: r.ok ? 500 : 400 }}>
                {r.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <button onClick={handleGuardar} disabled={loading || !todoOk} style={{ ...btnPrimary, opacity: (loading || !todoOk) ? 0.6 : 1, cursor: (loading || !todoOk) ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
      </button>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// PASO 4 — Éxito
// ══════════════════════════════════════════════════════════════
function PasoExito({ onLogin }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 1.25rem' }}>
        ✓
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--green-800)' }}>
        ¡Contraseña actualizada!
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
        Tu contraseña se actualizó correctamente.<br />Ya puedes iniciar sesión con tu nueva contraseña.
      </p>
      <button onClick={onLogin} style={btnPrimary}>
        Ir al inicio de sesión
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function RecuperarPassword() {
  const navigate = useNavigate();
  const [paso,   setPaso]   = useState(1);
  const [correo, setCorreo] = useState('');
  const [codigo, setCodigo] = useState('');

  return (
    <div style={bgStyle}>
      {/* Decoración */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {/* Logo */}
        <div style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid var(--green-700)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', fontSize: 22, fontWeight: 700, color: 'var(--green-800)' }}>
          ST
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green-800)', marginBottom: 2 }}>
          Secundaria Técnica 177
        </div>
        <div style={{ fontSize: 13, color: 'var(--green-700)', fontWeight: 500, marginBottom: '1.75rem' }}>
          Sistema PACAYAT
        </div>

        {/* Card */}
        <div style={cardStyle}>
          {paso < 4 && <StepIndicator paso={paso} />}

          {paso === 1 && (
            <Paso1 onNext={(c) => { setCorreo(c); setPaso(2); }} />
          )}
          {paso === 2 && (
            <Paso2 correo={correo} onNext={(c) => { setCodigo(c); setPaso(3); }} onBack={() => setPaso(1)} />
          )}
          {paso === 3 && (
            <Paso3 correo={correo} codigo={codigo} onExito={() => setPaso(4)} />
          )}
          {paso === 4 && (
            <PasoExito onLogin={() => navigate('/login')} />
          )}

          {/* Volver al login (pasos 1-3) */}
          {paso < 4 && (
            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'inherit' }}>
                ← Volver al inicio de sesión
              </button>
            </div>
          )}
        </div>

        <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.4)', marginTop: '1.5rem' }}>
          © 2026 Secundaria Técnica 177 — Sistema PACAYAT
        </p>
      </div>

      {/* Help FAB */}
      <button style={{ position: 'fixed', bottom: 24, right: 24, width: 44, height: 44, borderRadius: '50%', background: '#374151', color: '#fff', border: 'none', fontSize: 18, fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-md)', zIndex: 300 }}>
        ?
      </button>
    </div>
  );
}
