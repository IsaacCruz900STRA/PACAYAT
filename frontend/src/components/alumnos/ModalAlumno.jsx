import { useEffect, useMemo, useState } from 'react';
import Button from '../ui/Button';
import { showToast } from '../ui/Toast';
import { createAlumno, updateAlumno, validarMatricula } from '../../api/alumnos.api';
import { getTutores } from '../../api/tutores.api';

const GRADOS = ['1', '2', '3'];
const SECCIONES = ['A', 'B', 'C', 'D', 'E', 'F'];
const SEXOS = [
  { value: 'H', label: 'Hombre' },
  { value: 'M', label: 'Mujer' },
];
const ESTADOS = [
  { value: 'AS', label: 'Aguascalientes' },
  { value: 'BC', label: 'Baja California' },
  { value: 'BS', label: 'Baja California Sur' },
  { value: 'CC', label: 'Campeche' },
  { value: 'CS', label: 'Chiapas' },
  { value: 'CH', label: 'Chihuahua' },
  { value: 'CL', label: 'Coahuila' },
  { value: 'CM', label: 'Colima' },
  { value: 'DF', label: 'Ciudad de México' },
  { value: 'DG', label: 'Durango' },
  { value: 'GT', label: 'Guanajuato' },
  { value: 'GR', label: 'Guerrero' },
  { value: 'HG', label: 'Hidalgo' },
  { value: 'JC', label: 'Jalisco' },
  { value: 'MC', label: 'México' },
  { value: 'MN', label: 'Michoacán' },
  { value: 'MS', label: 'Morelos' },
  { value: 'NT', label: 'Nayarit' },
  { value: 'NL', label: 'Nuevo León' },
  { value: 'OC', label: 'Oaxaca' },
  { value: 'PL', label: 'Puebla' },
  { value: 'QT', label: 'Querétaro' },
  { value: 'QR', label: 'Quintana Roo' },
  { value: 'SP', label: 'San Luis Potosí' },
  { value: 'SL', label: 'Sinaloa' },
  { value: 'SR', label: 'Sonora' },
  { value: 'TC', label: 'Tabasco' },
  { value: 'TS', label: 'Tamaulipas' },
  { value: 'TL', label: 'Tlaxcala' },
  { value: 'VZ', label: 'Veracruz' },
  { value: 'YN', label: 'Yucatán' },
  { value: 'ZS', label: 'Zacatecas' },
  { value: 'NE', label: 'Nacido en el extranjero' },
];

const initialForm = {
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  matricula: '',
  curpSuffix: '',
  fechaNacimiento: '',
  sexo: '',
  estadoNacimiento: '',
  domicilio: '',
  grado: '',
  grupo: '',
  puntosConducta: 100,
  activo: true,
  tutorNombre: '',
  tutorTelefono: '',
  tutorCorreo: '',
  tutorCurp: '',
  tutorPassword: '',
  tutorConfirmarPassword: '',
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

function sanitizeNameInput(value) {
  return value
    .toUpperCase()
    .replace(/[^A-ZÁÉÍÓÚÜÑ\s]/g, '')
    .replace(/\s+/g, ' ')
    .trimStart();
}

function formatDisplayName(value) {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(normalizeWord)
    .join(' ');
}

function getFirstInternalVowel(value) {
  return value.slice(1).split('').find(ch => /[AEIOU]/i.test(ch)) || 'X';
}

function getFirstInternalConsonant(value) {
  return value.slice(1).split('').find(ch => /[BCDFGHJKLMNPQRSTVWXYZ]/i.test(ch)) || 'X';
}

function generateRandomMatricula() {
  const year = String(new Date().getFullYear()).slice(-2);
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `${year}177${random}`;
}

async function generateUniqueMatricula() {
  let candidate = generateRandomMatricula();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const { data } = await validarMatricula(candidate);
      if (data.disponible) return candidate;
    } catch {
      // ignore and retry with a new candidate
    }
    candidate = generateRandomMatricula();
  }
  return candidate;
}

function parseLocalDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function calculateCurpPrefix({ nombres, apellidoPaterno, apellidoMaterno, fechaNacimiento, sexo, estadoNacimiento }) {
  const normalize = (text) => text
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

  const paterno = normalize(apellidoPaterno);
  const materno = normalize(apellidoMaterno);
  const nombresNorm = normalize(nombres);

  const letra1 = paterno[0] || 'X';
  const letra2 = getFirstInternalVowel(paterno);
  const letra3 = materno[0] || 'X';
  const letra4 = nombresNorm[0] || 'X';

  const fecha = fechaNacimiento ? parseLocalDate(fechaNacimiento) : null;
  const yy = fecha ? String(fecha.getFullYear()).slice(-2) : '00';
  const mm = fecha ? String(fecha.getMonth() + 1).padStart(2, '0') : '00';
  const dd = fecha ? String(fecha.getDate()).padStart(2, '0') : '00';

  const consonantePaterno = getFirstInternalConsonant(paterno);
  const consonanteMaterno = getFirstInternalConsonant(materno);
  const consonanteNombre = getFirstInternalConsonant(nombresNorm);
  const sexoChar = (sexo === 'H' || sexo === 'M') ? sexo : 'X';
  const entidad = estadoNacimiento && /^[A-Z]{2}$/.test(estadoNacimiento) ? estadoNacimiento : 'XX';

  return [
    letra1,
    letra2,
    letra3,
    letra4,
    yy,
    mm,
    dd,
    sexoChar,
    entidad,
    consonantePaterno,
    consonanteMaterno,
    consonanteNombre,
  ].join('');
}

function isValidCurp(curp) {
  return /^[A-ZÑ]{4}\d{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-ZÑ]{3}[A-Z0-9]{2}$/.test(curp.trim().toUpperCase());
}

export default function ModalAlumno({ open, alumno = null, onClose, onSaved }) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [checkingMatricula, setCheckingMatricula] = useState(false);
  const [matriculaDisponible, setMatriculaDisponible] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [tutorExistente, setTutorExistente] = useState(false);
  const isEdit = Boolean(alumno?.id);

  useEffect(() => {
    if (!open) return;

    if (alumno) {
      setForm({
        ...splitNombreCompleto(alumno.nombreCompleto || ''),
        matricula: alumno.matricula || '',
        curpSuffix: alumno.curp?.slice(16) || '',
        fechaNacimiento: alumno.fechaNacimiento ? alumno.fechaNacimiento.slice(0, 10) : '',
        sexo: alumno.curp?.[10] || '',
        estadoNacimiento: alumno.curp?.slice(11, 13) || '',
        domicilio: alumno.domicilio || '',
        grado: alumno.inscripciones?.[0]?.grupo?.grado ? String(alumno.inscripciones[0].grupo.grado) : '',
        grupo: alumno.inscripciones?.[0]?.grupo?.seccion || '',
        puntosConducta: alumno.puntosConducta ?? 100,
        activo: alumno.activo ?? true,
        tutorNombre: alumno.tutor?.nombreCompleto || '',
        tutorTelefono: alumno.tutor?.telefono || '',
        tutorCorreo: alumno.tutor?.correo || '',
        tutorCurp: alumno.tutor?.curp || '',
        tutorPassword: '',
        tutorConfirmarPassword: '',
      });
    } else {
      setForm({ ...initialForm, matricula: '' });
      generateUniqueMatricula().then(matricula => setForm(prev => ({ ...prev, matricula }))).catch(() => {
        setForm(prev => ({ ...prev, matricula: generateRandomMatricula() }));
      });
    }

    setMatriculaDisponible(true);
    setShowPass(false);
    setTutorExistente(false);
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

  useEffect(() => {
    const curp = form.tutorCurp.trim().toUpperCase();
    if (!open || curp.length < 18) { setTutorExistente(false); return; }
    const timeout = setTimeout(() => {
      getTutores({ curp })
        .then(({ data }) => setTutorExistente((data.tutores || []).some(t => t.curp === curp)))
        .catch(() => setTutorExistente(false));
    }, 400);
    return () => clearTimeout(timeout);
  }, [open, form.tutorCurp]);

  const fechaNacimientoValida = useMemo(() => {
    if (!form.fechaNacimiento) return false;
    const fecha = parseLocalDate(form.fechaNacimiento);
    return fecha ? fecha < new Date(2015, 0, 1) : false;
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
    sexo: form.sexo,
    estadoNacimiento: form.estadoNacimiento,
  }), [form.nombres, form.apellidoPaterno, form.apellidoMaterno, form.fechaNacimiento, form.sexo, form.estadoNacimiento]);

  const tutorPasswordVisible = !tutorExistente && isEdit; // only editable when editing an existing alumno

  const tutorPasswordError = useMemo(() => {
    if (!tutorPasswordVisible) return '';
    if (!form.tutorPassword.trim()) return 'La contraseña del tutor es obligatoria';
    if (form.tutorPassword.trim().length < 6) return 'Mínimo 6 caracteres';
    if (form.tutorPassword !== form.tutorConfirmarPassword) return 'Las contraseñas no coinciden';
    return '';
  }, [tutorPasswordVisible, form.tutorPassword, form.tutorConfirmarPassword]);

  const validationError = useMemo(() => {
    if (!form.nombres.trim()) return 'Ingresa los nombres del alumno.';
    if (!form.apellidoPaterno.trim()) return 'Ingresa el apellido paterno del alumno.';
    if (!form.apellidoMaterno.trim()) return 'Ingresa el apellido materno del alumno.';
    if (!form.matricula.trim()) return 'La matrícula no puede estar vacía.';
    if (!form.curpSuffix.trim() || form.curpSuffix.trim().length !== 2 || !/^[A-Z0-9]{2}$/.test(form.curpSuffix.trim())) {
      return 'La parte final de la CURP debe tener 2 caracteres válidos.';
    }
    if (!form.fechaNacimiento) return 'Selecciona la fecha de nacimiento.';
    if (!fechaNacimientoValida) return 'La fecha de nacimiento debe ser anterior a 2015.';
    if (!form.sexo) return 'Selecciona el sexo del alumno.';
    if (!form.estadoNacimiento) return 'Selecciona el estado de nacimiento.';
    if (!form.grado) return 'Selecciona un grado.';
    if (!form.grupo) return 'Selecciona un grupo.';
    if (!form.domicilio.trim()) return 'Ingresa el domicilio del alumno.';
    if (!puntosConductaValida) return 'Los puntos de conducta deben ser un número entre 0 y 100.';
    if (!form.tutorNombre.trim()) return 'Ingresa el nombre del tutor.';
    if (!form.tutorTelefono.trim()) return 'Ingresa el teléfono del tutor.';
    if (!form.tutorCorreo.trim()) return 'Ingresa el correo del tutor.';
    if (!form.tutorCurp.trim() || form.tutorCurp.trim().length !== 18) return 'La CURP del tutor debe tener 18 caracteres.';
    if (!isValidCurp(form.tutorCurp)) return 'La CURP del tutor no tiene un formato válido.';
    if (!matriculaDisponible) return 'La matrícula ya existe.';
    if (tutorPasswordError) return tutorPasswordError;
    return '';
  }, [form, fechaNacimientoValida, puntosConductaValida, matriculaDisponible, tutorPasswordError]);

  const requiredComplete = useMemo(() => (
    form.nombres.trim()
    && form.apellidoPaterno.trim()
    && form.apellidoMaterno.trim()
    && form.matricula.trim()
    && form.curpSuffix.trim().length === 2
    && form.curpSuffix.trim().toUpperCase() === form.curpSuffix.trim()
    && form.curpSuffix.trim().match(/^[A-Z0-9]{2}$/)
    && form.fechaNacimiento
    && form.sexo
    && form.estadoNacimiento
    && form.grado
    && form.grupo
    && puntosConductaValida
    && form.tutorNombre.trim()
    && form.tutorTelefono.trim()
    && form.tutorCorreo.trim()
    && form.tutorCurp.trim().length === 18
    && isValidCurp(form.tutorCurp)
    && !tutorPasswordError
  ), [form, puntosConductaValida, tutorPasswordError]);

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
        .map(formatDisplayName)
        .join(' '),
      matricula: form.matricula,
      curp: `${curpBase}${form.curpSuffix.trim().toUpperCase()}`,
      fechaNacimiento: form.fechaNacimiento,
      domicilio: form.domicilio,
      grupo: `${form.grado}°${form.grupo}`,
      puntosConducta: Number(form.puntosConducta),
      activo: form.activo,
      tutor: {
        nombreCompleto: formatDisplayName(form.tutorNombre),
        telefono: form.tutorTelefono,
        correo: form.tutorCorreo,
        curp: form.tutorCurp.trim().toUpperCase(),
        ...(form.tutorPassword.trim() ? { password: form.tutorPassword.trim() } : {}),
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
          <Field label="Nombres" value={form.nombres} onChange={v => setValue('nombres', sanitizeNameInput(v))} required />
          <Field label="Apellido paterno" value={form.apellidoPaterno} onChange={v => setValue('apellidoPaterno', sanitizeNameInput(v))} required />
          <Field label="Apellido materno" value={form.apellidoMaterno} onChange={v => setValue('apellidoMaterno', sanitizeNameInput(v))} required />
          <SelectField
            label="Sexo"
            value={form.sexo}
            onChange={v => setValue('sexo', v)}
            options={SEXOS}
            required
            placeholder="Selecciona sexo"
          />
          <Field
            label="Fecha de nacimiento"
            type="date"
            value={form.fechaNacimiento}
            onChange={v => setValue('fechaNacimiento', v)}
            required
            error={form.fechaNacimiento && !fechaNacimientoValida ? 'Debe ser anterior a 2015' : ''}
          />
          <SelectField
            label="Estado de nacimiento"
            value={form.estadoNacimiento}
            onChange={v => setValue('estadoNacimiento', v)}
            options={ESTADOS}
            required
            placeholder="Selecciona el estado"
          />
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
              <span>CURP <span style={{ color: '#dc2626' }}>*</span></span>
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
            label="Matrícula"
            value={form.matricula}
            onChange={v => setValue('matricula', v)}
            required
            readOnly={!isEdit}
            error={!matriculaDisponible ? 'La matrícula ya existe' : ''}
            hint={checkingMatricula ? 'Validando matrícula...' : isEdit ? 'No editable en modo edición' : 'Se generará automáticamente'}
          />
          <SelectField label="Grado" value={form.grado} onChange={v => setValue('grado', v)} options={GRADOS} required />
          <SelectField label="Grupo" value={form.grupo} onChange={v => setValue('grupo', v)} options={SECCIONES} required />
          <Field
            label="Puntos de conducta"
            type="number"
            value={form.puntosConducta}
            onChange={v => isEdit && setValue('puntosConducta', v)}
            required
            min={0}
            max={100}
            readOnly={!isEdit}
            error={!puntosConductaValida ? 'Debe ser un número entre 0 y 100' : ''}
            hint={!isEdit ? 'Valor inicial fijo de 100 puntos se asigna al crear' : ''}
          />
          <Field label="Domicilio" value={form.domicilio} onChange={v => setValue('domicilio', v)} required />
          {isEdit && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, alignSelf: 'end', paddingBottom: 10 }}>
              <input type="checkbox" checked={form.activo} onChange={e => setValue('activo', e.target.checked)} />
              Alumno activo
            </label>
          )}
        </div>

        <h4 style={{ margin: '22px 0 12px' }}>Tutor</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Nombre del tutor" value={form.tutorNombre} onChange={v => setValue('tutorNombre', sanitizeNameInput(v))} required />
          <Field
            label="CURP del tutor"
            value={form.tutorCurp}
            onChange={v => setValue('tutorCurp', v.toUpperCase().replace(/[^A-ZÑ0-9]/g, '').slice(0, 18))}
            required
            maxLength={18}
            hint={
              form.tutorCurp.length === 18
                ? isValidCurp(form.tutorCurp)
                  ? tutorExistente
                    ? '✓ Tutor registrado — se vinculará a su cuenta existente'
                    : 'Tutor nuevo — se creará una cuenta'
                  : 'Formato de CURP inválido'
                : 'Escribe los 18 caracteres de la CURP'
            }
            error={
              form.tutorCurp.length > 0 && form.tutorCurp.length < 18
                ? 'La CURP debe tener 18 caracteres'
                : form.tutorCurp.length === 18 && !isValidCurp(form.tutorCurp)
                  ? 'CURP con formato incorrecto'
                  : ''
            }
          />
          <Field label="Teléfono" value={form.tutorTelefono} onChange={v => setValue('tutorTelefono', v)} required />
          <Field label="Correo" type="email" value={form.tutorCorreo} onChange={v => setValue('tutorCorreo', v)} required />
        </div>

        {tutorPasswordVisible && (
          <div style={{ marginTop: 14, padding: 14, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-hover)' }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Contraseña de acceso del tutor (usuario: nombre completo normalizado)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <PasswordField
                label="Contraseña del tutor"
                value={form.tutorPassword}
                onChange={v => setValue('tutorPassword', v)}
                show={showPass}
                onToggle={() => setShowPass(p => !p)}
                required={!tutorExistente}
              />
              <PasswordField
                label="Confirmar contraseña"
                value={form.tutorConfirmarPassword}
                onChange={v => setValue('tutorConfirmarPassword', v)}
                show={showPass}
                onToggle={() => setShowPass(p => !p)}
                required={!tutorExistente}
              />
            </div>
            {tutorPasswordError && (form.tutorPassword || !isEdit) && (
              <p style={{ marginTop: 6, fontSize: 12, color: 'var(--color-error, #dc2626)' }}>{tutorPasswordError}</p>
            )}
          </div>
        )}

        {tutorExistente && (
          <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: 13, color: '#166534' }}>
            Este tutor ya tiene cuenta en el sistema. Se vinculará a los alumnos sin cambiar su contraseña.
          </div>
        )}

        {validationError && (
          <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 'var(--radius)', background: '#fee2e2', color: 'var(--red-700)', fontSize: 13, fontWeight: 600 }}>
            {validationError}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
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
    <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
      <span>{label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}</span>
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

function PasswordField({ label, value, onChange, show, onToggle, required = false }) {
  return (
    <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
      {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          required={required}
          onChange={event => onChange(event.target.value)}
          style={{ width: '100%', padding: '9px 38px 9px 11px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
        />
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16, color: 'var(--text-secondary, #6b7280)', padding: 0, lineHeight: 1 }}
        >
          {show ? '🙈' : '👁'}
        </button>
      </div>
    </label>
  );
}

function SelectField({ label, value, onChange, options, required = false, placeholder = 'Selecciona una opción' }) {
  return (
    <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
      <span>{label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}</span>
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
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value ?? option} value={option.value ?? option}>
            {option.label ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}
