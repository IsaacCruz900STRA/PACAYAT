import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { buscarAlumnos } from '../../api/alumnos.api';
import { createReporte }  from '../../api/reportes.api';
import { showToast }      from '../ui/Toast';

const GRAVEDADES = {
  Negativo: [
    { value: 'GRAVE',     label: 'Grave · -10 puntos',    delta: -10 },
    { value: 'MEDIO',     label: 'Medio · -5 puntos',     delta: -5  },
    { value: 'NO_GRAVE',  label: 'No grave · -2 puntos',  delta: -2  },
  ],
  Positivo: [
    { value: 'MUY_POSITIVO', label: 'Muy positivo · +6 puntos',  delta: 6 },
    { value: 'MEDIANAMENTE', label: 'Medianamente · +4 puntos',  delta: 4 },
    { value: 'LEVE',         label: 'Leve · +2 puntos',         delta: 2 },
  ],
};

/**
 * alumnoPreset: { id, nombre, matricula, puntosConducta }
 * Si se pasa, el buscador se oculta y los campos vienen pre-llenados.
 */
export default function ModalCrearReporte({ open, onClose, alumnoPreset = null, onSuccess }) {
  const [query,     setQuery]     = useState('');
  const [resultados,setResultados]= useState([]);
  const [alumno,    setAlumno]    = useState(alumnoPreset);
  const [tipo,      setTipo]      = useState('Negativo');
  const [gravedad,  setGravedad]  = useState('GRAVE');
  const [descripcion,setDescripcion]=useState('');
  const [saving,    setSaving]    = useState(false);
  const [searching, setSearching] = useState(false);

  // Si cambia el preset (ej. desde otra fila de la tabla)
  useEffect(() => {
    setAlumno(alumnoPreset);
  }, [alumnoPreset]);

  // Buscar alumnos con debounce
  useEffect(() => {
    if (alumnoPreset || query.length < 2) { setResultados([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await buscarAlumnos(query);
        setResultados(data);
      } catch { setResultados([]); }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, alumnoPreset]);

  const gravedadesActuales = GRAVEDADES[tipo];
  const gravedadObj  = gravedadesActuales.find(g => g.value === gravedad) || gravedadesActuales[0];
  const ptsActuales  = alumno?.puntosConducta ?? 0;
  const ptsDespues   = Math.max(0, Math.min(100, ptsActuales + gravedadObj.delta));

  const handleTipoChange = (nuevoTipo) => {
    setTipo(nuevoTipo);
    setGravedad(GRAVEDADES[nuevoTipo][0].value);
  };

  const handleAlumnoSelect = (a) => {
    setAlumno(a);
    setQuery(a.nombre);
    setResultados([]);
  };

  const handleSave = async () => {
    if (!alumno || !descripcion.trim()) return;
    setSaving(true);
    try {
      await createReporte({
        idAlumno: alumno.id,
        tipo: tipo.toUpperCase(),
        gravedad,
        descripcion: descripcion.trim(),
      });
      showToast('Reporte guardado exitosamente', 'success');
      onSuccess?.();
      handleClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al guardar el reporte', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!alumnoPreset) { setQuery(''); setAlumno(null); }
    setTipo('Negativo');
    setGravedad('GRAVE');
    setDescripcion('');
    setResultados([]);
    onClose();
  };

  const inputBase = {
    width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)', fontSize: 14, outline: 'none',
  };

  return (
    <Modal open={open} onClose={handleClose} title="Crear Reporte" width={520}>

      {/* Buscador — solo si no hay preset */}
      {!alumnoPreset && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>
            Buscar Alumno
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--text-muted)' }}>🔍</span>
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setAlumno(null); }}
              placeholder="Buscar por matrícula o nombre..."
              style={{ ...inputBase, paddingLeft: 36 }}
              onFocus={e => e.target.style.borderColor = 'var(--green-600)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Resultados */}
          {(resultados.length > 0 || searching) && !alumno && (
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginTop: 4 }}>
              {searching
                ? <div style={{ padding: '10px 14px', fontSize: 14, color: 'var(--text-secondary)' }}>Buscando...</div>
                : resultados.map(a => (
                  <div key={a.id} onClick={() => handleAlumnoSelect(a)}
                    style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: 14 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--green-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <div style={{ fontWeight: 500 }}>{a.nombre}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.matricula} · {a.grupo} · {a.puntosConducta} pts</div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      )}

      {/* Nombre (readonly) */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Nombre del Alumno</label>
        <input value={alumno?.nombre || ''} readOnly style={{ ...inputBase, background: 'var(--bg-hover)', color: 'var(--text-secondary)' }} />
      </div>

      {/* Matrícula (readonly) */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Matrícula</label>
        <input value={alumno?.matricula || ''} readOnly style={{ ...inputBase, background: 'var(--bg-hover)', color: 'var(--text-secondary)' }} />
      </div>

      {/* Tipo */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Tipo de Reporte</label>
        <div style={{ position: 'relative' }}>
          <select value={tipo} onChange={e => handleTipoChange(e.target.value)}
            style={{ ...inputBase, appearance: 'none', cursor: 'pointer', padding: '10px 36px 10px 38px' }}
            onFocus={e => e.target.style.borderColor = 'var(--green-600)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}>
            <option>Negativo</option>
            <option>Positivo</option>
          </select>
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 12, color: 'var(--text-muted)' }}>▾</span>
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            width: 10, height: 10, borderRadius: '50%', pointerEvents: 'none',
            background: tipo === 'Negativo' ? 'var(--red-500)' : 'var(--green-500)',
          }} />
        </div>
      </div>

      {/* Gravedad */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Gravedad</label>
        <div style={{ position: 'relative' }}>
          <select value={gravedad} onChange={e => setGravedad(e.target.value)}
            style={{ ...inputBase, appearance: 'none', cursor: 'pointer', paddingRight: 36 }}
            onFocus={e => e.target.style.borderColor = 'var(--green-600)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}>
            {gravedadesActuales.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 12, color: 'var(--text-muted)' }}>▾</span>
        </div>

        {/* Preview puntos en tiempo real */}
        {alumno && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginTop: 8,
            padding: '10px 14px', background: 'var(--bg-hover)',
            borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: 14,
          }}>
            <span style={{ fontWeight: 600 }}>{ptsActuales} pts</span>
            <span style={{ color: 'var(--text-muted)' }}>→</span>
            <span style={{ fontWeight: 700, color: gravedadObj.delta < 0 ? 'var(--red-600)' : 'var(--green-700)' }}>
              {ptsDespues} pts
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
              ({gravedadObj.delta > 0 ? '+' : ''}{gravedadObj.delta} puntos)
            </span>
          </div>
        )}
      </div>

      {/* Descripción */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 5 }}>Descripción</label>
        <textarea
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          placeholder="Describe la situación..."
          rows={3}
          style={{ ...inputBase, resize: 'vertical', lineHeight: 1.5 }}
          onFocus={e => e.target.style.borderColor = 'var(--green-600)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Button variant="outline" onClick={handleClose}>Cancelar</Button>
        <Button
          onClick={handleSave}
          disabled={!alumno || !descripcion.trim() || saving}
        >
          {saving ? 'Guardando...' : 'Guardar Reporte'}
        </Button>
      </div>
    </Modal>
  );
}
