import { useEffect, useMemo, useState } from 'react';
import Button from '../ui/Button';
import { showToast } from '../ui/Toast';
import { createAlumno, updateAlumno, validarMatricula } from '../../api/alumnos.api';

const GRADOS = ['1', '2', '3'];
const SECCIONES = ['A', 'B', 'C', 'D', 'E', 'F'];

const initialForm = {
  nombreCompleto: '',
  matricula: '',
  curp: '',
  fechaNacimiento: '',
  domicilio: '',
  grado: '',
  grupo: '',
  puntosConducta: 100,
  activo: true,
  tutorNombre: '',
  tutorTelefono: '',
  tutorCorreo: '',
};

export default function ModalAlumno({ open, alumno = null, onClose, onSaved }) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [checkingMatricula, setCheckingMatricula] = useState(false);
  const [matriculaDisponible, setMatriculaDisponible] = useState(true);
  const isEdit = Boolean(alumno?.id);

  useEffect(() => {
    if (!open) return;
    setForm(alumno ? {
      nombreCompleto: alumno.nombreCompleto || '',
      matricula: alumno.matricula || '',
      curp: alumno.curp || '',
      fechaNacimiento: alumno.fechaNacimiento ? alumno.fechaNacimiento.slice(0, 10) : '',
      domicilio: alumno.domicilio || '',
      grado: alumno.inscripciones?.[0]?.grupo?.grado ? String(alumno.inscripciones[0].grupo.grado) : '',
      grupo: alumno.inscripciones?.[0]?.grupo?.seccion || '',
      puntosConducta: alumno.puntosConducta ?? 100,
      activo: alumno.activo ?? true,
      tutorNombre: alumno.tutor?.nombreCompleto || '',
      tutorTelefono: alumno.tutor?.telefono || '',
      tutorCorreo: alumno.tutor?.correo || '',
    } : initialForm);
    setMatriculaDisponible(true);
  }, [open, alumno]);

  useEffect(() => {
    if (!open || !form.matricula.trim()) {
      setMatriculaDisponible(true);
      return;
    }

    const timeout = setTimeout(async () => {
      setCheckingMatricula(true);
      try {
        const { data } = await validarMatricula(form.matricula.trim(), alumno?.id);
        setMatriculaDisponible(Boolean(data.disponible));
      } catch (err) {
        setMatriculaDisponible(false);
      } finally {
        setCheckingMatricula(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [open, form.matricula, alumno?.id]);

  const requiredComplete = useMemo(() => (
    form.nombreCompleto.trim()
    && form.matricula.trim()
    && form.curp.trim()
    && form.fechaNacimiento
    && form.grado
    && form.grupo
    && form.tutorNombre.trim()
    && form.tutorTelefono.trim()
    && form.tutorCorreo.trim()
  ), [form]);

  if (!open) return null;

  const setValue = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const guardar = async (event) => {
    event.preventDefault();
    if (!requiredComplete) {
      showToast('Todos los campos son obligatorios excepto domicilio', 'error');
      return;
    }
    if (!matriculaDisponible) {
      showToast('La matrícula ya existe', 'error');
      return;
    }

    setSaving(true);
    const payload = {
      nombreCompleto: form.nombreCompleto,
      matricula: form.matricula,
      curp: form.curp,
      fechaNacimiento: form.fechaNacimiento,
      domicilio: form.domicilio,
      grupo: `${form.grado}°${form.grupo}`,
      puntosConducta: Number(form.puntosConducta),
      activo: form.activo,
      tutor: {
        nombreCompleto: form.tutorNombre,
        telefono: form.tutorTelefono,
        correo: form.tutorCorreo,
      },
    };

    try {
      if (isEdit) {
        await updateAlumno(alumno.id, payload);
        showToast('Alumno actualizado');
      } else {
        await createAlumno(payload);
        showToast('Alumno registrado');
      }
      onSaved?.();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al guardar alumno', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(17, 24, 39, 0.45)',
      zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <form onSubmit={guardar} style={{ width: 'min(780px, 100%)', maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ fontSize: 20 }}>{isEdit ? 'Editar alumno' : 'Nuevo alumno'}</h3>
          <button type="button" onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 22 }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Nombre completo" value={form.nombreCompleto} onChange={v => setValue('nombreCompleto', v)} required />
          <Field
            label="Matrícula"
            value={form.matricula}
            onChange={v => setValue('matricula', v)}
            required
            error={!matriculaDisponible ? 'La matrícula ya existe' : ''}
            hint={checkingMatricula ? 'Validando matrícula...' : ''}
          />
          <Field label="CURP" value={form.curp} onChange={v => setValue('curp', v)} required />
          <Field label="Fecha de nacimiento" type="date" value={form.fechaNacimiento} onChange={v => setValue('fechaNacimiento', v)} required />
          <SelectField label="Grado" value={form.grado} onChange={v => setValue('grado', v)} options={GRADOS} required />
          <SelectField label="Grupo" value={form.grupo} onChange={v => setValue('grupo', v)} options={SECCIONES} required />
          <Field label="Puntos de conducta" type="number" value={form.puntosConducta} onChange={v => setValue('puntosConducta', v)} required />
          <Field label="Domicilio" value={form.domicilio} onChange={v => setValue('domicilio', v)} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, alignSelf: 'end', paddingBottom: 10 }}>
            <input type="checkbox" checked={form.activo} onChange={e => setValue('activo', e.target.checked)} />
            Alumno activo
          </label>
        </div>

        <h4 style={{ margin: '22px 0 12px' }}>Tutor</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Nombre del tutor" value={form.tutorNombre} onChange={v => setValue('tutorNombre', v)} required />
          <Field label="Teléfono" value={form.tutorTelefono} onChange={v => setValue('tutorTelefono', v)} required />
          <Field label="Correo" type="email" value={form.tutorCorreo} onChange={v => setValue('tutorCorreo', v)} required />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving || checkingMatricula || !requiredComplete || !matriculaDisponible}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = false, error = '', hint = '' }) {
  return (
    <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
      {label}
      <input
        type={type}
        value={value}
        required={required}
        onChange={event => onChange(event.target.value)}
        style={{
          padding: '9px 11px',
          border: `1.5px solid ${error ? 'var(--red-500)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          fontSize: 14,
          outline: 'none',
        }}
      />
      {(error || hint) && (
        <span style={{ fontSize: 12, color: error ? 'var(--red-600)' : 'var(--text-secondary)' }}>{error || hint}</span>
      )}
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
        style={{
          padding: '9px 11px',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius)',
          fontSize: 14,
          outline: 'none',
          background: '#fff',
        }}
      >
        <option value="">Selecciona un grupo</option>
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}
