// src/pages/secretaria/Avisos.jsx — CRUD completo, recicla lógica de admin/GestionAvisos
import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card       from '../../components/ui/Card';
import Button     from '../../components/ui/Button';
import Modal      from '../../components/ui/Modal';
import { showToast } from '../../components/ui/Toast';
import { getAvisos, createAviso, updateAviso, deleteAviso } from '../../api/avisos.api';

const TIPOS_FORM = [
  { value: 'CONDUCTA',      label: 'Conducta',      destinatario: 'Tutores' },
  { value: 'REINSCRIPCION', label: 'Reinscripción', destinatario: 'Tutores' },
  { value: 'GENERAL',       label: 'General',       destinatario: 'Todos'   },
];

const TIPO_STYLE = {
  CONDUCTA:           { border: '#ef4444', bg: '#fff5f5', badgeBg: '#fee2e2', badgeColor: '#991b1b' },
  PERIODO_EVALUACION: { border: '#3b82f6', bg: '#eff6ff', badgeBg: '#dbeafe', badgeColor: '#1e40af' },
  REINSCRIPCION:      { border: '#f59e0b', bg: '#fffbeb', badgeBg: '#fef3c7', badgeColor: '#92400e' },
  GENERAL:            { border: '#22c55e', bg: '#f0fdf4', badgeBg: '#dcfce7', badgeColor: '#166534' },
};

const DESTINATARIO_LABEL = {
  CONDUCTA: 'Tutores', REINSCRIPCION: 'Tutores',
  GENERAL: 'Todos', PERIODO_EVALUACION: 'Tutores y Docentes',
};

const CANALES_OPTS = [
  { value: 'PLATAFORMA', label: '🖥️ Plataforma' },
  { value: 'CORREO',     label: '📧 Correo' },
  { value: 'WHATSAPP',   label: '📱 WhatsApp' },
];

const FORM_INICIAL = { tipo: 'CONDUCTA', titulo: '', mensaje: '', umbralPuntos: '', canales: ['PLATAFORMA'] };

function fmtFecha(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const hoy = new Date();
  const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
  const misma = (a, b) => a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  const hora = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  if (misma(d, hoy))  return `Hoy, ${hora}`;
  if (misma(d, ayer)) return `Ayer, ${hora}`;
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) + `, ${hora}`;
}

export default function SecretariaAvisos() {
  const [tab,       setTab]       = useState('CONDUCTA');
  const [avisos,    setAvisos]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando,  setEditando]  = useState(null);
  const [form,      setForm]      = useState(FORM_INICIAL);
  const [saving,    setSaving]    = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAvisos();
      setAvisos(res.data?.avisos || []);
    } catch { showToast('Error al cargar avisos', 'error'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const avisosFiltrados = tab === 'CONDUCTA'
    ? avisos.filter(a => a.tipo === 'CONDUCTA')
    : avisos.filter(a => a.tipo !== 'CONDUCTA');

  const abrirCrear = () => {
    setEditando(null);
    setForm({ ...FORM_INICIAL, tipo: tab === 'CONDUCTA' ? 'CONDUCTA' : 'GENERAL' });
    setModalOpen(true);
  };

  const abrirEditar = (aviso) => {
    setEditando(aviso);
    setForm({ tipo: aviso.tipo, titulo: aviso.titulo, mensaje: aviso.mensaje, umbralPuntos: aviso.umbralPuntos ?? '', canales: aviso.canales || [] });
    setModalOpen(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.mensaje.trim()) {
      showToast('Título y mensaje son obligatorios', 'error'); return;
    }
    setSaving(true);
    try {
      const payload = {
        tipo: form.tipo, titulo: form.titulo.trim(), mensaje: form.mensaje.trim(),
        canales: form.canales,
        umbralPuntos: form.tipo === 'CONDUCTA' && form.umbralPuntos ? parseInt(form.umbralPuntos) : null,
      };
      if (editando) await updateAviso(editando.id, payload);
      else          await createAviso(payload);
      showToast(editando ? 'Aviso actualizado' : 'Aviso creado');
      setModalOpen(false);
      cargar();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al guardar aviso', 'error');
    } finally { setSaving(false); }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este aviso?')) return;
    try {
      await deleteAviso(id);
      showToast('Aviso eliminado', 'info');
      cargar();
    } catch { showToast('Error al eliminar', 'error'); }
  };

  const toggleCanal = (canal) => setForm(p => ({
    ...p, canales: p.canales.includes(canal) ? p.canales.filter(c => c !== canal) : [...p.canales, canal],
  }));

  const inputS = { width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, outline: 'none', fontFamily: 'inherit' };
  const tabBtn = (id, label, count) => (
    <button key={id} onClick={() => setTab(id)} style={{
      padding: '8px 18px', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: tab === id ? 600 : 500,
      border: '1.5px solid', cursor: 'pointer', fontFamily: 'inherit',
      borderColor: tab === id ? 'var(--green-700)' : 'var(--border)',
      background:  tab === id ? 'var(--green-700)' : '#fff',
      color:       tab === id ? '#fff' : 'var(--text-secondary)',
    }}>{label} ({count})</button>
  );

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader
        title="Gestión de Avisos"
        subtitle={loading ? 'Cargando...' : `${avisos.length} avisos registrados`}
        action={<Button onClick={abrirCrear}>+ Nuevo Aviso</Button>}
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        {tabBtn('CONDUCTA', 'Conducta',  avisos.filter(a => a.tipo === 'CONDUCTA').length)}
        {tabBtn('GENERAL',  'Generales', avisos.filter(a => a.tipo !== 'CONDUCTA').length)}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Cargando avisos...</div>
      ) : avisosFiltrados.length === 0 ? (
        <Card style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
          <div style={{ fontWeight: 600 }}>Sin avisos en esta categoría</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Crea el primero con el botón de arriba.</div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {avisosFiltrados.map(aviso => {
            const st = TIPO_STYLE[aviso.tipo] || TIPO_STYLE.GENERAL;
            return (
              <div key={aviso.id} style={{ background: st.bg, border: `1px solid ${st.border}`, borderLeftWidth: 4, borderRadius: 'var(--radius-lg)', padding: '1.25rem', opacity: aviso.activo ? 1 : 0.6 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{aviso.titulo}</h3>
                      <span style={{ background: st.badgeBg, color: st.badgeColor, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>
                        {TIPOS_FORM.find(t => t.value === aviso.tipo)?.label || aviso.tipo}
                      </span>
                      {!aviso.activo && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#e5e7eb', color: '#6b7280' }}>Inactivo</span>}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 6px', lineHeight: 1.5 }}>{aviso.mensaje}</p>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtFecha(aviso.creadoEn)}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                      <strong>Destinatarios:</strong> {DESTINATARIO_LABEL[aviso.tipo] || 'Todos'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button onClick={() => abrirEditar(aviso)} title="Editar"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: 'var(--blue-600)', padding: '4px 6px', borderRadius: 6 }}>✏️</button>
                    <button onClick={() => handleEliminar(aviso.id)} title="Eliminar"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: 'var(--red-500)', padding: '4px 6px', borderRadius: 6 }}>🗑️</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editando ? 'Editar aviso' : 'Nuevo aviso'} width={520}>
        <form onSubmit={handleGuardar}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Tipo *</label>
              <select name="tipo" value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} style={{ ...inputS, appearance: 'none', paddingRight: 32 }}>
                {TIPOS_FORM.map(t => <option key={t.value} value={t.value}>{t.label} — {t.destinatario}</option>)}
              </select>
            </div>
            {form.tipo === 'CONDUCTA' && (
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Umbral de puntos (opcional)</label>
                <input type="number" min={0} max={100} value={form.umbralPuntos}
                  onChange={e => setForm(p => ({ ...p, umbralPuntos: e.target.value }))}
                  placeholder="Ej. 60" style={inputS} />
              </div>
            )}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Título *</label>
              <input value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} placeholder="Título del aviso" style={inputS} required />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Mensaje *</label>
              <textarea value={form.mensaje} onChange={e => setForm(p => ({ ...p, mensaje: e.target.value }))}
                placeholder="Descripción detallada del aviso..." rows={4} style={{ ...inputS, resize: 'vertical' }} required />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Canales de difusión</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CANALES_OPTS.map(c => {
                  const sel = form.canales.includes(c.value);
                  return (
                    <button key={c.value} type="button" onClick={() => toggleCanal(c.value)} style={{
                      padding: '6px 14px', borderRadius: 'var(--radius)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                      border: `1.5px solid ${sel ? 'var(--green-700)' : 'var(--border)'}`,
                      background: sel ? 'var(--green-700)' : '#fff', color: sel ? '#fff' : 'var(--text-secondary)',
                    }}>{c.label}</button>
                  );
                })}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '9px 18px', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>Cancelar</button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : (editando ? 'Actualizar' : 'Crear aviso')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
