// src/pages/control-escolar/Periodos.jsx
// Recicla la misma vista de admin/ConfigurarPeriodos
import { useEffect, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card       from '../../components/ui/Card';
import Button     from '../../components/ui/Button';
import Badge      from '../../components/ui/Badge';
import Table      from '../../components/ui/Table';
import { showToast } from '../../components/ui/Toast';
import { formatDate } from '../../utils/formatters';
import { getPeriodoActivo, getPeriodos, updatePeriodo } from '../../api/periodos.api';

const ESTADO_VARIANT = { 'No Activo': 'neutral', Activo: 'success', Próximo: 'info' };

function calcularEstado(fechaInicio, fechaFin) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inicio = new Date(fechaInicio);
  const fin    = new Date(fechaFin);
  inicio.setHours(0, 0, 0, 0);
  fin.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((inicio - today) / 86400000);
  if (today >= inicio && today <= fin) return 'Activo';
  if (today > fin) return 'No Activo';
  if (diffDays <= 7) return 'Próximo';
  return 'No Activo';
}

export default function ControlEscolarPeriodos() {
  const [periodos,       setPeriodos]       = useState([]);
  const [periodoEscolar, setPeriodoEscolar] = useState(null);
  const [modalPeriodo,   setModalPeriodo]   = useState(null);

  const cargar = async () => {
    try {
      const [periodoActivoRes, periodosRes] = await Promise.all([
        getPeriodoActivo(),
        getPeriodos(),
      ]);
      setPeriodoEscolar(periodoActivoRes.data);
      setPeriodos((periodosRes.data?.periodos || []).map(p => ({
        ...p,
        estado: calcularEstado(p.fechaInicio, p.fechaFin),
      })));
    } catch {
      showToast('Error al cargar periodos', 'error');
    }
  };

  useEffect(() => { cargar(); }, []);

  const columns = [
    { key: 'nombre',     label: 'Nombre',       render: v => <span style={{ fontWeight: 500 }}>{v}</span> },
    { key: 'fechaInicio', label: 'Fecha inicio', render: v => <span style={{ color: 'var(--text-secondary)' }}>{formatDate(v)}</span> },
    { key: 'fechaFin',   label: 'Fecha fin',     render: v => <span style={{ color: 'var(--text-secondary)' }}>{formatDate(v)}</span> },
    { key: 'estado',     label: 'Estado',        width: 120,
      render: v => <Badge variant={ESTADO_VARIANT[v] || 'neutral'} dot={v === 'Activo'}>{v}</Badge> },
    { key: 'id', label: 'Acciones', width: 90,
      render: (_, row) => (
        <button title="Editar periodo" onClick={() => setModalPeriodo(row)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: 'var(--blue-600)', padding: '4px 6px', borderRadius: 6 }}>
          ✏️
        </button>
      ),
    },
  ];

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader title="Periodos de Evaluación" subtitle="Consulta los periodos escolares y de evaluación" />

      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: '1rem' }}>Periodo Escolar Activo</h3>
        <div style={{
          borderLeft: '4px solid var(--green-600)', borderRadius: '0 var(--radius-lg) var(--radius-lg) 0',
          padding: '1.25rem', background: '#fff', boxShadow: 'var(--shadow)',
          border: '1px solid var(--border)', borderLeftColor: 'var(--green-600)',
        }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{periodoEscolar?.nombre || '—'}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
            {formatDate(periodoEscolar?.fechaInicio)} – {formatDate(periodoEscolar?.fechaFin)}
          </div>
          <div style={{ marginTop: 8 }}><Badge variant="success" dot>Activo</Badge></div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: '1rem' }}>Periodos de Evaluación Parcial</h3>
        <Card style={{ padding: 0 }}>
          <Table columns={columns} data={periodos} emptyMessage="No hay periodos registrados" />
        </Card>
      </div>

      <ModalPeriodo
        periodo={modalPeriodo}
        onClose={() => setModalPeriodo(null)}
        onSaved={() => { setModalPeriodo(null); cargar(); }}
      />
    </div>
  );
}

function ModalPeriodo({ periodo, onClose, onSaved }) {
  const [form,   setForm]   = useState({ nombre: '', fechaInicio: '', fechaFin: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!periodo) return;
    setForm({
      nombre:      periodo.nombre || '',
      fechaInicio: periodo.fechaInicio ? periodo.fechaInicio.slice(0, 10) : '',
      fechaFin:    periodo.fechaFin    ? periodo.fechaFin.slice(0, 10)    : '',
    });
  }, [periodo]);

  if (!periodo) return null;

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.fechaInicio || !form.fechaFin) {
      showToast('Todos los campos son obligatorios', 'error'); return;
    }
    if (new Date(form.fechaInicio) > new Date(form.fechaFin)) {
      showToast('La fecha de inicio no puede ser posterior a la fecha fin', 'error'); return;
    }
    setSaving(true);
    try {
      await updatePeriodo(periodo.id, form);
      showToast('Periodo actualizado');
      onSaved();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al actualizar periodo', 'error');
    } finally {
      setSaving(false);
    }
  };

  const estadoCalculado = calcularEstado(form.fechaInicio, form.fechaFin);
  const inputS = { padding: '9px 11px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, outline: 'none', width: '100%' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,.45)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <form onSubmit={guardar} style={{ width: 'min(520px,100%)', background: '#fff', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ fontSize: 20 }}>Editar periodo</h3>
          <button type="button" onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 22 }}>×</button>
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          {[
            { label: 'Nombre',       key: 'nombre',      type: 'text' },
            { label: 'Fecha inicio', key: 'fechaInicio', type: 'date' },
            { label: 'Fecha fin',    key: 'fechaFin',    type: 'date' },
          ].map(f => (
            <label key={f.key} style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
              {f.label}
              <input type={f.type} value={form[f.key]} required
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={inputS} />
            </label>
          ))}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Estado calculado</div>
            <Badge variant={ESTADO_VARIANT[estadoCalculado] || 'neutral'} dot={estadoCalculado === 'Activo'}>{estadoCalculado}</Badge>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
        </div>
      </form>
    </div>
  );
}
