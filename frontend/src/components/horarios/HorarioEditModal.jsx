// Modal para editar una celda del horario importado:
// permite cambiar docente, salón, o vaciar la celda.
import { useState, useEffect } from 'react';

export default function HorarioEditModal({ celda, dia, slot, docentes, onSave, onClose }) {
  const [materia,  setMateria]  = useState(celda?.materia  || '');
  const [docente,  setDocente]  = useState(celda?.docente   || '');
  const [salon,    setSalon]    = useState(celda?.salon     || '');
  const [idAsig,   setIdAsig]   = useState(celda?.idAsignacion ?? null);

  useEffect(() => {
    setMateria(celda?.materia  || '');
    setDocente(celda?.docente   || '');
    setSalon(celda?.salon       || '');
    setIdAsig(celda?.idAsignacion ?? null);
  }, [celda]);

  const HORAS = {
    1:'07:00–07:50', 2:'07:50–08:40', 3:'08:40–09:30',
    4:'10:00–10:50', 5:'10:50–11:40', 6:'11:40–12:30',
    7:'12:30–13:20', 8:'13:20–14:10', 9:'14:10–15:00',
  };

  function handleSave() {
    if (!materia.trim()) { onSave(null); return; } // celda vacía
    onSave({
      ...(celda || {}),
      materia: materia.trim(),
      docente: docente.trim() || null,
      salon:   salon.trim()   || null,
      idAsignacion: idAsig,
    });
  }

  const overlay = {
    position:'fixed', inset:0, background:'rgba(0,0,0,.45)',
    display:'flex', alignItems:'center', justifyContent:'center', zIndex:9000,
  };
  const box = {
    background:'#fff', borderRadius:12, padding:'1.75rem 2rem',
    width:'100%', maxWidth:440, boxShadow:'0 8px 40px rgba(0,0,0,.18)',
    display:'flex', flexDirection:'column', gap:'1rem',
  };
  const label = { fontSize:12, fontWeight:700, color:'#374151', marginBottom:4, display:'block' };
  const input = {
    width:'100%', padding:'9px 12px', border:'1.5px solid #d1d5db',
    borderRadius:8, fontSize:14, fontFamily:'inherit', outline:'none',
    boxSizing:'border-box',
  };
  const btnRow = { display:'flex', gap:8, justifyContent:'flex-end', marginTop:4 };

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={box}>
        {/* Header */}
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:'#111827' }}>
            Editar bloque
          </div>
          <div style={{ fontSize:12, color:'#6b7280', marginTop:2 }}>
            {dia} · Bloque {slot} · {HORAS[slot]}
          </div>
        </div>

        {/* Materia */}
        <div>
          <label style={label}>Materia</label>
          <input
            style={input} value={materia}
            onChange={e => setMateria(e.target.value)}
            placeholder="Nombre de la materia"
          />
        </div>

        {/* Docente: selector si hay lista, o texto libre */}
        <div>
          <label style={label}>Docente</label>
          {docentes?.length > 0 ? (
            <select
              style={{ ...input, cursor:'pointer' }}
              value={docente}
              onChange={e => {
                setDocente(e.target.value);
                const sel = docentes.find(d => d.nombre === e.target.value);
                // idAsignacion se resuelve en el backend; aquí solo guardamos nombre
              }}
            >
              <option value="">— Sin asignar —</option>
              {docentes.map(d => (
                <option key={d.id} value={d.nombre}>{d.nombre}</option>
              ))}
            </select>
          ) : (
            <input
              style={input} value={docente}
              onChange={e => setDocente(e.target.value)}
              placeholder="Nombre del docente"
            />
          )}
        </div>

        {/* Salón */}
        <div>
          <label style={label}>Salón</label>
          <input
            style={input} value={salon}
            onChange={e => setSalon(e.target.value)}
            placeholder="Ej. Aula 12, Lab. Cómputo…"
          />
        </div>

        {/* Vaciar celda */}
        <div style={{ borderTop:'1px solid #e5e7eb', paddingTop:'0.75rem' }}>
          <button
            onClick={() => onSave(null)}
            style={{
              background:'none', border:'none', color:'#ef4444', fontSize:13,
              cursor:'pointer', fontFamily:'inherit', padding:0,
            }}
          >
            Vaciar esta celda
          </button>
        </div>

        {/* Botones */}
        <div style={btnRow}>
          <button
            onClick={onClose}
            style={{ padding:'9px 20px', borderRadius:8, border:'1.5px solid #d1d5db', background:'#fff', fontSize:14, cursor:'pointer', fontFamily:'inherit' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            style={{ padding:'9px 22px', borderRadius:8, border:'none', background:'#166534', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
