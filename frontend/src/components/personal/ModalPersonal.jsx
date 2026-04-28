import { useEffect, useMemo, useState } from 'react';
import Button from '../ui/Button';
import { showToast } from '../ui/Toast';
import { createPersonal, updatePersonal } from '../../api/personal.api';
import { getMaterias } from '../../api/materias.api';

export const ROL_OPTIONS = [
  ['DOCENTE', 'Docente'],
  ['ADMINISTRATIVO', 'Administrativo'],
  ['PREFECTO', 'Prefecto'],
  ['SECRETARIA', 'Secretaria'],
  ['CONTROL_ESCOLAR', 'Control Escolar'],
  ['DIRECTIVO', 'Directivo'],
  ['ADMIN', 'Administrador'],
];

const ESPECIALIDADES = ['Turismo', 'Informática', 'Electrónica', 'Contabilidad', 'Diseño Gráfico', 'Diseño Industrial', 'ninguno'];

const initialForm = {
  nombre: '',
  rol: '',
  contacto: '',
  correo: '',
  estado: 'Activo',
  especialidad: 'ninguno',
  gradoMateria: '1',
  materiaIds: [],
};

export default function ModalPersonal({ open, personal = null, onClose, onSaved }) {
  const [form, setForm] = useState(initialForm);
  const [materias, setMaterias] = useState([]);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(personal?.id);

  useEffect(() => {
    if (!open) return;
    setForm(personal ? {
      nombre: personal.nombre || '',
      rol: personal.rol || '',
      contacto: personal.contacto || personal.telefono || '',
      correo: personal.correo || '',
      estado: personal.activo ? 'Activo' : 'Inactivo',
      especialidad: personal.especialidad || 'ninguno',
      gradoMateria: '1',
      materiaIds: personal.materiaIds || personal.materias?.map(materia => materia.id) || [],
    } : initialForm);
  }, [open, personal]);

  useEffect(() => {
    if (!open) return;
    getMaterias()
      .then(({ data }) => setMaterias(data.materias || []))
      .catch(() => showToast('Error al cargar materias', 'error'));
  }, [open]);

  const requiredComplete = useMemo(() => {
    const base = form.nombre.trim() && form.rol && form.contacto.trim() && form.estado;
    if (form.rol !== 'DOCENTE') return base;
    return base && form.especialidad && form.materiaIds.length > 0;
  }, [form]);

  if (!open) return null;

  const setValue = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleMateria = (materiaId) => {
    setForm(prev => {
      const exists = prev.materiaIds.includes(materiaId);
      return {
        ...prev,
        materiaIds: exists
          ? prev.materiaIds.filter(id => id !== materiaId)
          : [...prev.materiaIds, materiaId],
      };
    });
  };

  const guardar = async (event) => {
    event.preventDefault();
    if (!requiredComplete) {
      showToast('Todos los campos son obligatorios', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre,
        rol: form.rol,
        contacto: form.contacto,
        correo: form.correo,
        estado: form.estado,
        especialidad: form.especialidad,
        materiaIds: form.rol === 'DOCENTE' ? form.materiaIds : [],
      };

      if (isEdit) await updatePersonal(personal.id, payload);
      else await createPersonal(payload);

      showToast(isEdit ? 'Personal actualizado' : 'Personal registrado');
      onSaved?.();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al guardar personal', 'error');
    } finally {
      setSaving(false);
    }
  };

  const materiasDelGrado = materias.filter(materia => String(materia.grado) === String(form.gradoMateria));

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(17, 24, 39, 0.45)',
      zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <form onSubmit={guardar} style={{ width: 'min(820px, 100%)', maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ fontSize: 20 }}>{isEdit ? 'Editar personal' : 'Nuevo personal'}</h3>
          <button type="button" onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 22 }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Nombre" value={form.nombre} onChange={v => setValue('nombre', v)} required />
          <SelectField label="Rol" value={form.rol} onChange={v => setValue('rol', v)} options={ROL_OPTIONS} required />
          <Field label="Contacto" value={form.contacto} onChange={v => setValue('contacto', v)} required />
          <Field label="Correo" type="email" value={form.correo} onChange={v => setValue('correo', v)} />
          <SelectField label="Estado" value={form.estado} onChange={v => setValue('estado', v)} options={[['Activo', 'Activo'], ['Inactivo', 'Inactivo']]} required />
        </div>

        {form.rol === 'DOCENTE' && (
          <div style={{ marginTop: 22, padding: 16, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-hover)' }}>
            <h4 style={{ marginBottom: 12 }}>Asignación de materias</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <SelectField label="Especialidad" value={form.especialidad} onChange={v => setValue('especialidad', v)} options={ESPECIALIDADES.map(v => [v, v])} required />
              <SelectField label="Grado" value={form.gradoMateria} onChange={v => setValue('gradoMateria', v)} options={[['1', '1°'], ['2', '2°'], ['3', '3°']]} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
              {materiasDelGrado.map(materia => {
                const checked = form.materiaIds.includes(materia.id);
                return (
                  <label key={materia.id} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14, background: '#fff', padding: '8px 10px', borderRadius: 8 }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleMateria(materia.id)} />
                    {materia.nombre}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving || !requiredComplete}>{saving ? 'Guardando...' : 'Guardar'}</Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = false }) {
  return (
    <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
      {label}
      <input
        type={type}
        value={value}
        required={required}
        onChange={event => onChange(event.target.value)}
        style={{ padding: '9px 11px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, outline: 'none' }}
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options, required = false }) {
  return (
    <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
      {label}
      <select
        value={value}
        required={required}
        onChange={event => onChange(event.target.value)}
        style={{ padding: '9px 11px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, outline: 'none', background: '#fff' }}
      >
        <option value="">Selecciona</option>
        {options.map(([valueOption, labelOption]) => <option key={valueOption} value={valueOption}>{labelOption}</option>)}
      </select>
    </label>
  );
}
