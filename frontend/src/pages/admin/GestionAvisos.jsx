import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Button     from '../../components/ui/Button';
import Modal      from '../../components/ui/Modal';
import { showToast } from '../../components/ui/Toast';
import { getAvisos, createAviso, updateAviso, deleteAviso } from '../../api/avisos.api';

// ── Constantes ────────────────────────────────────────────────────────────────
const TABS = [
  { label: 'Conducta', tipo: 'CONDUCTA' },
  { label: 'Generales', tipo: 'GENERAL' },
];

// Tipos disponibles para crear (PERIODO_EVALUACION se gestiona automáticamente)
const TIPOS_FORM = [
  { value: 'CONDUCTA',     label: 'Conducta',      destinatario: 'Tutores' },
  { value: 'REINSCRIPCION',label: 'Reinscripción', destinatario: 'Tutores' },
  { value: 'GENERAL',      label: 'General',       destinatario: 'Todos'   },
];

const DESTINATARIO_LABEL = {
  CONDUCTA:           'Tutores',
  REINSCRIPCION:      'Tutores',
  GENERAL:            'Todos',
  PERIODO_EVALUACION: 'Tutores y Docentes',
};

const TIPO_STYLE = {
  CONDUCTA:           { border: '#ef4444', bg: '#fff5f5', badgeBg: '#fee2e2', badgeColor: '#991b1b' },
  PERIODO_EVALUACION: { border: '#3b82f6', bg: '#eff6ff', badgeBg: '#dbeafe', badgeColor: '#1e40af' },
  REINSCRIPCION:      { border: '#f59e0b', bg: '#fffbeb', badgeBg: '#fef3c7', badgeColor: '#92400e' },
  GENERAL:            { border: '#22c55e', bg: '#f0fdf4', badgeBg: '#dcfce7', badgeColor: '#166534' },
};

const CANALES_OPTS = [
  { value: 'PLATAFORMA', label: '🖥️ Plataforma' },
  { value: 'CORREO',     label: '📧 Correo' },
  { value: 'WHATSAPP',   label: '📱 WhatsApp' },
];

const CANAL_ICON = { PLATAFORMA: '🖥️', CORREO: '📧', WHATSAPP: '📱' };

const FORM_INICIAL = {
  tipo: 'CONDUCTA', titulo: '', mensaje: '', umbralPuntos: '', canales: ['PLATAFORMA'],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function labelTipo(tipo) {
  if (tipo === 'CONDUCTA') return 'Conducta';
  return 'Generales';
}

// ── Componente principal ───────────────────────────────────────────────────────
export default function GestionAvisos() {
  const [tab,        setTab]        = useState('CONDUCTA');
  const [avisos,     setAvisos]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editando,   setEditando]   = useState(null); // null = crear, objeto = editar
  const [form,       setForm]       = useState(FORM_INICIAL);
  const [saving,     setSaving]     = useState(false);

  // ── Carga avisos ─────────────────────────────────────────────────────────────
  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAvisos();
      setAvisos(res.data?.avisos || []);
    } catch {
      showToast('Error al cargar avisos', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const avisosFiltrados = tab === 'CONDUCTA'
    ? avisos.filter(a => a.tipo === 'CONDUCTA')
    : avisos.filter(a => a.tipo !== 'CONDUCTA');

  // ── Modal helpers ─────────────────────────────────────────────────────────────
  const abrirCrear = () => {
    setEditando(null);
    // Si el tab es GENERAL, el formulario inicia en GENERAL; CONDUCTA en CONDUCTA
    setForm({ ...FORM_INICIAL, tipo: tab === 'CONDUCTA' ? 'CONDUCTA' : 'GENERAL' });
    setModalOpen(true);
  };

  const abrirEditar = (aviso) => {
    setEditando(aviso);
    setForm({
      tipo:         aviso.tipo,
      titulo:       aviso.titulo,
      mensaje:      aviso.mensaje,
      umbralPuntos: aviso.umbralPuntos ?? '',
      canales:      aviso.canales || [],
    });
    setModalOpen(true);
  };

  const cerrarModal = () => { setModalOpen(false); setEditando(null); };

  // ── Cambios del formulario ────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleCanal = (canal) => {
    setForm(prev => ({
      ...prev,
      canales: prev.canales.includes(canal)
        ? prev.canales.filter(c => c !== canal)
        : [...prev.canales, canal],
    }));
  };

  // ── Guardar ───────────────────────────────────────────────────────────────────
  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.mensaje.trim()) {
      showToast('Título y mensaje son obligatorios', 'error');
      return;
    }
    if (form.canales.length === 0) {
      showToast('Selecciona al menos un canal', 'error');
      return;
    }

    const payload = {
      tipo:         form.tipo,
      titulo:       form.titulo.trim(),
      mensaje:      form.mensaje.trim(),
      umbralPuntos: form.tipo === 'CONDUCTA' && form.umbralPuntos !== ''
                      ? parseInt(form.umbralPuntos) : null,
      canales:      form.canales,
    };

    setSaving(true);
    try {
      if (editando) {
        await updateAviso(editando.id, payload);
        showToast('Aviso actualizado');
      } else {
        await createAviso(payload);
        showToast('Aviso creado');
      }
      cerrarModal();
      cargar();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al guardar aviso', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Eliminar ──────────────────────────────────────────────────────────────────
  const handleEliminar = async (aviso) => {
    if (!window.confirm(`¿Eliminar el aviso "${aviso.titulo}"?`)) return;
    try {
      await deleteAviso(aviso.id);
      showToast('Aviso eliminado');
      cargar();
    } catch {
      showToast('Error al eliminar aviso', 'error');
    }
  };

  // ── Toggle activo ─────────────────────────────────────────────────────────────
  const handleToggleActivo = async (aviso) => {
    try {
      await updateAviso(aviso.id, { activo: !aviso.activo });
      showToast(aviso.activo ? 'Aviso desactivado' : 'Aviso activado');
      cargar();
    } catch {
      showToast('Error al actualizar aviso', 'error');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader title="Avisos" subtitle="Gestiona las alertas y notificaciones automáticas" />

      {/* Barra de tabs + botón */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.tipo} onClick={() => setTab(t.tipo)} style={{
              padding: '8px 18px', borderRadius: 'var(--radius)', fontSize: 14,
              fontWeight: tab === t.tipo ? 600 : 500,
              border: '1.5px solid',
              borderColor: tab === t.tipo ? 'var(--green-700)' : 'var(--border)',
              background: tab === t.tipo ? 'var(--green-700)' : '#fff',
              color: tab === t.tipo ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all var(--transition)',
            }}>
              {t.label}
            </button>
          ))}
        </div>
        <Button onClick={abrirCrear}>+ Crear Aviso</Button>
      </div>

      {/* Lista de avisos */}
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando avisos...</div>
      ) : avisosFiltrados.length === 0 ? (
        <div style={{
          padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)',
          background: '#fff', borderRadius: 'var(--radius)', border: '1px dashed var(--border)',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Sin avisos de tipo {labelTipo(tab)}</div>
          <div style={{ fontSize: 13 }}>Crea uno con el botón "+ Crear Aviso"</div>
        </div>
      ) : avisosFiltrados.map(aviso => (
        <AvisoCard
          key={aviso.id}
          aviso={aviso}
          onEditar={() => abrirEditar(aviso)}
          onEliminar={() => handleEliminar(aviso)}
          onToggleActivo={() => handleToggleActivo(aviso)}
        />
      ))}

      {/* Modal crear/editar */}
      <Modal
        open={modalOpen}
        onClose={cerrarModal}
        title={editando ? 'Editar Aviso' : 'Crear Aviso'}
        width={560}
      >
        <form onSubmit={handleGuardar}>
          <FormField label="Tipo de aviso">
            <select
              name="tipo" value={form.tipo}
              onChange={handleChange}
              disabled={!!editando}
              style={inputStyle}
            >
              {TIPOS_FORM.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>👥</span>
              <span>Destinatarios: <strong>{DESTINATARIO_LABEL[form.tipo] || 'Todos'}</strong></span>
            </div>
          </FormField>

          <FormField label="Título *">
            <input
              name="titulo" value={form.titulo}
              onChange={handleChange}
              placeholder="Ej: Alerta de conducta crítica"
              style={inputStyle} maxLength={100}
            />
          </FormField>

          <FormField label="Mensaje *">
            <textarea
              name="mensaje" value={form.mensaje}
              onChange={handleChange}
              placeholder="Texto que recibirán los tutores o docentes..."
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </FormField>

          {form.tipo === 'CONDUCTA' && (
            <FormField label="Umbral de puntos (0–100)">
              <input
                name="umbralPuntos" type="number"
                value={form.umbralPuntos} onChange={handleChange}
                placeholder="Ej: 50 — se activa cuando el alumno baja a este valor"
                min={0} max={100}
                style={inputStyle}
              />
            </FormField>
          )}

          <FormField label="Canales de envío *">
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
              {CANALES_OPTS.map(c => (
                <label key={c.value} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={form.canales.includes(c.value)}
                    onChange={() => toggleCanal(c.value)}
                    style={{ accentColor: 'var(--green-700)', width: 16, height: 16 }}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: '1.75rem' }}>
            <Button type="button" variant="outline" onClick={cerrarModal}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : editando ? 'Actualizar' : 'Crear Aviso'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ── Tarjeta de aviso ──────────────────────────────────────────────────────────
function AvisoCard({ aviso, onEditar, onEliminar, onToggleActivo }) {
  const st = TIPO_STYLE[aviso.tipo] || TIPO_STYLE.GENERAL;

  return (
    <div style={{
      borderLeft: `4px solid ${st.border}`,
      borderRadius: '0 var(--radius) var(--radius) 0',
      padding: '1.25rem', background: st.bg,
      boxShadow: 'var(--shadow-sm)', border: `1px solid ${st.border}33`,
      borderLeftColor: st.border,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      gap: 12, marginBottom: '1rem',
      opacity: aviso.activo ? 1 : 0.55,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>{aviso.titulo}</span>
          {!aviso.activo && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#e5e7eb', color: '#6b7280' }}>
              Inactivo
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>
          {aviso.mensaje}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {aviso.umbralPuntos !== null && aviso.umbralPuntos !== undefined && (
            <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: st.badgeBg, color: st.badgeColor }}>
              ≤ {aviso.umbralPuntos} pts
            </span>
          )}
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            👥 {DESTINATARIO_LABEL[aviso.tipo] || 'Todos'}
          </span>
          {(aviso.canales || []).map(c => (
            <span key={c} title={c} style={{ fontSize: 17 }}>{CANAL_ICON[c] || c}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        <Button size="sm" variant="outline" onClick={onEditar}>✏️ Editar</Button>
        <button
          onClick={onToggleActivo}
          style={{
            padding: '6px 12px', borderRadius: 'var(--radius)', fontSize: 12, fontWeight: 600,
            border: '1.5px solid var(--border)', background: '#fff', cursor: 'pointer',
            color: aviso.activo ? '#6b7280' : 'var(--green-700)', fontFamily: 'inherit',
          }}
        >
          {aviso.activo ? '⏸ Desactivar' : '▶ Activar'}
        </button>
        <button
          onClick={onEliminar}
          style={{
            padding: '6px 12px', borderRadius: 'var(--radius)', fontSize: 12, fontWeight: 600,
            border: '1.5px solid #fca5a5', background: '#fff5f5', cursor: 'pointer',
            color: 'var(--red-600)', fontFamily: 'inherit',
          }}
        >
          🗑 Eliminar
        </button>
      </div>
    </div>
  );
}

// ── Helpers de formulario ─────────────────────────────────────────────────────
function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '9px 12px',
  border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
  fontSize: 14, fontFamily: 'inherit', outline: 'none',
  background: '#fff', color: 'var(--text-primary)',
  boxSizing: 'border-box',
};
