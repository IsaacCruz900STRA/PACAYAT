import { useEffect, useMemo, useState } from 'react';
import Button from '../ui/Button';
import { showToast } from '../ui/Toast';
import { createAlumno, updateAlumno, validarMatricula } from '../../api/alumnos.api';

const GRADOS = ['1', '2', '3'];
const SECCIONES = ['A', 'B', 'C', 'D', 'E', 'F'];

const initialForm = {
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  matricula: '',
  curpSuffix: '',
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

function normalizeWord(value) {
  const word = value.trim();
  if (!word) return '';
  return word[0].toUpperCase() + word.slice(1).toLowerCase();
}

function splitNombreCompleto(value) {
  const parts = value
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean);

  let nombres = '';
  let apellidoPaterno = '';
  let apellidoMaterno = '';

  if (parts.length === 1) {
    nombres = parts[0];
  } else if (parts.length === 2) {
    nombres = parts[0];
    apellidoPaterno = parts[1];
  } else if (parts.length >= 3) {
    nombres = parts.slice(0, -2).join(' ');
    apellidoPaterno = parts[parts.length - 2];
    apellidoMaterno = parts[parts.length - 1];
  }

  return {
    nombres: nombres.split(' ').map(normalizeWord).join(' '),
    apellidoPaterno: normalizeWord(apellidoPaterno),
    apellidoMaterno: normalizeWord(apellidoMaterno),
  };
}

function getFirstInternalVowel(value) {
  return value.slice(1).split('').find(ch => /[AEIOU]/i.test(ch)) || 'X';
}

function getFirstInternalConsonant(value) {
  return value.slice(1).split('').find(ch => /[BCDFGHJKLMNPQRSTVWXYZ]/i.test(ch)) || 'X';
}

function calculateCurpPrefix({ nombres, apellidoPaterno, apellidoMaterno, fechaNacimiento }) {
  const clean = (text) => text.trim().replace(/\s+/g, ' ').toUpperCase();
  const paterno = clean(apellidoPaterno);
  const materno = clean(apellidoMaterno);
  const nombresNorm = clean(nombres);

  const letra1 = paterno[0] || 'X';
  const letra2 = getFirstInternalVowel(paterno);
  const letra3 = materno[0] || 'X';
  const letra4 = nombresNorm[0] || 'X';

  const fecha = fechaNacimiento ? new Date(fechaNacimiento) : null;
  const yy = fecha ? String(fecha.getFullYear()).slice(-2) : '00';
  const mm = fecha ? String(fecha.getMonth() + 1).padStart(2, '0') : '00';
  const dd = fecha ? String(fecha.getDate()).padStart(2, '0') : '00';

  const consonantePaterno = getFirstInternalConsonant(paterno);
  const consonanteMaterno = getFirstInternalConsonant(materno);
  const consonanteNombre = getFirstInternalConsonant(nombresNorm);

  return [letra1, letra2, letra3, letra4, yy, mm, dd, 'X', 'X', consonantePaterno, consonanteMaterno, consonanteNombre, '0', '0', '0', '0']
    .join('');
}

export default function ModalAlumno({ open, alumno = null, onClose, onSaved }) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [checkingMatricula, setCheckingMatricula] = useState(false);
  const [matriculaDisponible, setMatriculaDisponible] = useState(true);
  const isEdit = Boolean(alumno?.id);

  useEffect(() => {
    if (!open) return;
    setForm(alumno ? {
      ...splitNombreCompleto(alumno.nombreCompleto || ''),
      matricula: alumno.matricula || '',
      curpSuffix: alumno.curp?.slice(16) || '',
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

  const fechaNacimientoValida = useMemo(() => {
    if (!form.fechaNacimiento) return false;
    return new Date(form.fechaNacimiento) < new Date('2015-01-01');
  }, [form.fechaNacimiento]);

  const puntosConductaValida = useMemo(() => {
    const valor = Number(form.puntosConducta);
    return Number.isFinite(valor) && valor >= 0 && valor <= 100;
  }, [form.puntosConducta]);

  const curpBase = useMemo(() => calculateCurpPrefix({
    nombres: form.nombres,
    apellidoPaterno: form.apellidoPaterno,
    apellidoMaterno: form.apellidoMaterno,
    fechaNacimiento: form.fechaNacimiento,
  }), [form.nombres, form.apellidoPaterno, form.apellidoMaterno, form.fechaNacimiento]);

  const requiredComplete = useMemo(() => (
    form.nombres.trim()
    && form.apellidoPaterno.trim()
    && form.apellidoMaterno.trim()
    && form.matricula.trim()
    && form.curpSuffix.trim().length === 2
    && form.curpSuffix.trim().toUpperCase() === form.curpSuffix.trim()
    && form.curpSuffix.trim().match(/^[A-Z0-9]{2}$/)
    && form.fechaNacimiento
    && form.grado
    && form.grupo
    && puntosConductaValida
    && form.tutorNombre.trim()
    && form.tutorTelefono.trim()
    && form.tutorCorreo.trim()
  ), [form, puntosConductaValida]);

  if (!open) return null;

  const setValue = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const guardar = async (event) => {
    event.preventDefault();
    if (!requiredComplete) {
      showToast('Todos los campos son obligatorios excepto domicilio y la CURP debe tener dos caracteres al final', 'error');
      return;
    }
    if (!fechaNacimientoValida) {
      showToast('La fecha de nacimiento debe ser anterior a 2015', 'error');
      return;
    }
    if (!puntosConductaValida) {
      showToast('Los puntos de conducta deben ser un número entre 0 y 100', 'error');
      return;
    }
    if (!matriculaDisponible) {
      showToast('La matrícula ya existe', 'error');
      return;
    }

    setSaving(true);
    const payload = {
      nombreCompleto: [form.nombres, form.apellidoPaterno, form.apellidoMaterno]
        .filter(Boolean)
        .map(part => normalizeWord(part))
        .join(' '),
      matricula: form.matricula,
      curp: `${curpBase}${form.curpSuffix.trim().toUpperCase()}`,
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
          <Field label="Nombres" value={form.nombres} onChange={v => setValue('nombres', v)} required />
          <Field
            label="Matrícula"
            value={form.matricula}
            onChange={v => setValue('matricula', v)}
            required
            readOnly={isEdit}
            error={!matriculaDisponible ? 'La matrícula ya existe' : ''}
            hint={checkingMatricula ? 'Validando matrícula...' : isEdit ? 'No editable en modo edición' : ''}
          />
          <Field label="Apellido paterno" value={form.apellidoPaterno} onChange={v => setValue('apellidoPaterno', v)} required />
          <Field label="Apellido materno" value={form.apellidoMaterno} onChange={v => setValue('apellidoMaterno', v)} required />
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
              CURP
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: `1.5px solid ${form.curpSuffix && !/^[A-Z0-9]{2}$/.test(form.curpSuffix) ? 'var(--red-500)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                background: '#fff',
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '9px 11px',
                  background: '#f3f4f6',
                  color: 'var(--text-secondary)',
                  fontSize: 14,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {curpBase}
                </span>
                <input
                  type="text"
                  value={form.curpSuffix}
                  required
                  maxLength={2}
                  onChange={event => setValue('curpSuffix', event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 2))}
                  style={{
                    width: 80,
                    padding: '9px 11px',
                    border: 'none',
                    fontSize: 14,
                    outline: 'none',
                    textTransform: 'uppercase',
                    color: 'var(--text-primary)',
                    background: 'transparent',
                  }}
                />
              </div>
              {(form.curpSuffix && !/^[A-Z0-9]{2}$/.test(form.curpSuffix)) && (
                <span style={{ fontSize: 12, color: 'var(--red-600)' }}>Solo letras y números, 2 caracteres</span>
              )}
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Los primeros 16 caracteres se generan automáticamente.</span>
            </label>
          </div>
          <Field
            label="Fecha de nacimiento"
            type="date"
            value={form.fechaNacimiento}
            onChange={v => setValue('fechaNacimiento', v)}
            required
            error={form.fechaNacimiento && !fechaNacimientoValida ? 'Debe ser anterior a 2015' : ''}
          />
          <SelectField label="Grado" value={form.grado} onChange={v => setValue('grado', v)} options={GRADOS} required />
          <SelectField label="Grupo" value={form.grupo} onChange={v => setValue('grupo', v)} options={SECCIONES} required />
          <Field
            label="Puntos de conducta"
            type="number"
            value={form.puntosConducta}
            onChange={v => setValue('puntosConducta', v)}
            required
            min={0}
            max={100}
            error={!puntosConductaValida ? 'Debe ser un número entre 0 y 100' : ''}
          />
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

function Field({ label, value, onChange, type = 'text', required = false, error = '', hint = '', readOnly = false, ...inputProps }) {
  return (
    <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
      {label}
      <input
        type={type}
        value={value}
        required={required}
        readOnly={readOnly}
        onChange={event => onChange(event.target.value)}
        {...inputProps}
        style={{
          padding: '9px 11px',
          border: `1.5px solid ${error ? 'var(--red-500)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          fontSize: 14,
          outline: 'none',
          background: readOnly ? '#f8fafc' : '#fff',
          cursor: readOnly ? 'not-allowed' : 'text',
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
