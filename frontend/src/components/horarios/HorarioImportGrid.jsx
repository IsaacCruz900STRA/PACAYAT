// Grid drag-and-drop para revisar y editar el horario importado desde PDF.
// Muestra un tab por grupo. Cada celda es arrastrable; clic abre modal de edición.
import { useState, useCallback } from 'react';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import HorarioEditModal from './HorarioEditModal';

// ── Paleta de colores por materia ──────────────────────────────────────────────
const PALETTE = [
  { bg:'#DBEAFE', bd:'#93C5FD', tx:'#1E40AF' },
  { bg:'#D1FAE5', bd:'#6EE7B7', tx:'#065F46' },
  { bg:'#FEF3C7', bd:'#FCD34D', tx:'#92400E' },
  { bg:'#FCE7F3', bd:'#F9A8D4', tx:'#9D174D' },
  { bg:'#F3E8FF', bd:'#D8B4FE', tx:'#6B21A8' },
  { bg:'#FFEDD5', bd:'#FDBA74', tx:'#C2410C' },
  { bg:'#CCFBF1', bd:'#5EEAD4', tx:'#0F766E' },
  { bg:'#FEE2E2', bd:'#FCA5A5', tx:'#991B1B' },
  { bg:'#E0E7FF', bd:'#A5B4FC', tx:'#3730A3' },
];
function colorDe(materia = '') {
  let h = 0; for (const c of materia) h = (h * 31 + c.charCodeAt(0)) % PALETTE.length;
  return PALETTE[h];
}

const DIAS_LABEL = { Lu:'Lunes', Ma:'Martes', Mi:'Miércoles', Ju:'Jueves', Vi:'Viernes' };
const DIAS       = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi'];
const BLOQUES    = [
  { n:1, h:'07:00–07:50' }, { n:2, h:'07:50–08:40' }, { n:3, h:'08:40–09:30' },
  { n:4, h:'10:00–10:50' }, { n:5, h:'10:50–11:40' }, { n:6, h:'11:40–12:30' },
  { n:7, h:'12:30–13:20' }, { n:8, h:'13:20–14:10' }, { n:9, h:'14:10–15:00' },
];

// ── Tarjeta draggable ──────────────────────────────────────────────────────────
function Tarjeta({ id, celda, onEdit, overlay = false }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  const col = colorDe(celda?.materia || '');
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity:   isDragging && !overlay ? 0.35 : 1,
    cursor:    'grab',
    background: col.bg,
    border:    `1.5px solid ${col.bd}`,
    borderRadius: 6,
    padding:   '5px 7px',
    height:    '100%',
    userSelect: 'none',
    boxSizing: 'border-box',
    display:   'flex', flexDirection:'column', justifyContent:'center',
    minHeight: 56,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      onDoubleClick={e => { e.stopPropagation(); onEdit?.(); }}
    >
      <div style={{ fontSize:11, fontWeight:700, color:col.tx, lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
        {celda?.materia || '—'}
      </div>
      {celda?.docente && (
        <div style={{ fontSize:10, color:col.tx, opacity:.75, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {celda.docente}
        </div>
      )}
      {celda?.salon && (
        <div style={{ fontSize:9, color:col.tx, opacity:.55, marginTop:1 }}>
          {celda.salon}
        </div>
      )}
    </div>
  );
}

// ── Celda droppable ────────────────────────────────────────────────────────────
function Celda({ id, celda, onEdit }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        padding: 3,
        border:  `1px solid ${isOver ? '#166534' : '#e5e7eb'}`,
        borderRadius: 6,
        background: isOver ? '#f0fdf4' : '#fafafa',
        minHeight: 64,
        transition: 'background .15s, border-color .15s',
        position: 'relative',
      }}
      onClick={() => !celda && onEdit?.()}  // clic en celda vacía → agregar
    >
      {celda ? (
        <Tarjeta id={id} celda={celda} onEdit={onEdit} />
      ) : (
        <div style={{
          height:'100%', minHeight:58, display:'flex', alignItems:'center', justifyContent:'center',
          color:'#d1d5db', fontSize:11, cursor:'pointer',
        }}
          onClick={onEdit}
        >
          + agregar
        </div>
      )}
    </div>
  );
}

// ── Grid principal ────────────────────────────────────────────────────────────
function Grid({ grid, onChange, docentes }) {
  const [editando, setEditando] = useState(null); // { dia, slot }
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  // id de celda: "Lu_1"
  function celda(id) {
    const [dia, slot] = id.split('_');
    return grid[dia]?.[parseInt(slot)] ?? null;
  }

  function handleDragEnd({ active, over }) {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const [diaA, slotA] = active.id.split('_');
    const [diaB, slotB] = over.id.split('_');
    const slotNumA = parseInt(slotA), slotNumB = parseInt(slotB);

    const newGrid = JSON.parse(JSON.stringify(grid));
    const tmp = newGrid[diaA]?.[slotNumA] ?? null;
    if (!newGrid[diaA]) newGrid[diaA] = {};
    if (!newGrid[diaB]) newGrid[diaB] = {};
    newGrid[diaA][slotNumA] = newGrid[diaB]?.[slotNumB] ?? null;
    newGrid[diaB][slotNumB] = tmp;
    onChange(newGrid);
  }

  function handleEdit(dia, slot) {
    setEditando({ dia, slot });
  }

  function handleSaveModal(nuevaCelda) {
    if (!editando) return;
    const { dia, slot } = editando;
    const newGrid = JSON.parse(JSON.stringify(grid));
    if (!newGrid[dia]) newGrid[dia] = {};
    newGrid[dia][slot] = nuevaCelda; // null = vaciar
    onChange(newGrid);
    setEditando(null);
  }

  const thStyle = {
    padding: '7px 4px', fontSize: 11, fontWeight: 700, color: '#166534',
    background: '#f0fdf4', textAlign: 'center',
    borderBottom: '1.5px solid #d1fae5', borderLeft: '1px solid #e5e7eb',
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={({ active }) => setActiveId(active.id)}
        onDragEnd={handleDragEnd}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, textAlign: 'left', borderLeft: 'none', width: 100, fontSize: 10 }}>
                  Bloque
                </th>
                {DIAS.map(d => (
                  <th key={d} style={thStyle}>{DIAS_LABEL[d]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BLOQUES.map((b, i) => (
                <>
                  {i === 3 && (
                    <tr key="receso">
                      <td colSpan={6} style={{
                        padding: '4px 10px', background: '#f1f5f9', textAlign: 'center',
                        fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '.05em',
                        borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0',
                      }}>
                        RECESO · 09:30–10:00
                      </td>
                    </tr>
                  )}
                  <tr key={b.n}>
                    <td style={{ padding: '4px 8px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#166534' }}>Bloque {b.n}</div>
                      <div style={{ fontSize: 9, color: '#9ca3af' }}>{b.h}</div>
                    </td>
                    {DIAS.map(dia => {
                      const id = `${dia}_${b.n}`;
                      return (
                        <td key={dia} style={{ padding: 4, borderBottom: '1px solid #e5e7eb', borderLeft: '1px solid #e5e7eb', verticalAlign: 'top' }}>
                          <Celda
                            id={id}
                            celda={celda(id)}
                            onEdit={() => handleEdit(dia, b.n)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                </>
              ))}
            </tbody>
          </table>
        </div>

        <DragOverlay>
          {activeId ? (
            <div style={{ opacity: .9, transform: 'rotate(2deg)', pointerEvents: 'none' }}>
              <Tarjeta id={activeId} celda={celda(activeId)} overlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {editando && (
        <HorarioEditModal
          celda={grid[editando.dia]?.[editando.slot] ?? null}
          dia={DIAS_LABEL[editando.dia]}
          slot={editando.slot}
          docentes={docentes}
          onSave={handleSaveModal}
          onClose={() => setEditando(null)}
        />
      )}
    </>
  );
}

// ── Componente principal exportado ────────────────────────────────────────────
export default function HorarioImportGrid({ grupos: gruposInit, docentes, onGuardar, guardando }) {
  const [grupos,      setGrupos]      = useState(gruposInit);
  const [tabIndex,    setTabIndex]    = useState(0);
  const [gradoFiltro, setGradoFiltro] = useState('1');

  const gruposFiltrados = grupos.filter(g => g.nombre.startsWith(gradoFiltro));
  const grupoActual     = gruposFiltrados[tabIndex] ?? null;

  const handleGridChange = useCallback((nuevoGrid) => {
    setGrupos(prev => prev.map(g =>
      g.nombre === grupoActual?.nombre ? { ...g, grid: nuevoGrid } : g
    ));
  }, [grupoActual]);

  if (!grupos.length) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
      No se encontraron grupos en el PDF.
    </div>
  );

  // Tabs de grado
  const gradosDisponibles = [...new Set(grupos.map(g => g.nombre[0]))].sort();

  // Tabs de grupo dentro del grado
  function contarCeldas(grupo) {
    let n = 0;
    for (const slots of Object.values(grupo.grid || {}))
      for (const c of Object.values(slots)) if (c) n++;
    return n;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Filtro de grado */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Grado:</span>
        {gradosDisponibles.map(g => (
          <button key={g} onClick={() => { setGradoFiltro(g); setTabIndex(0); }}
            style={{
              padding: '5px 16px', borderRadius: 8, border: '1.5px solid',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              borderColor: gradoFiltro === g ? '#166534' : '#d1d5db',
              background:  gradoFiltro === g ? '#166534' : '#fff',
              color:       gradoFiltro === g ? '#fff'    : '#374151',
            }}
          >
            {g}°
          </button>
        ))}
      </div>

      {/* Tabs de grupo */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {gruposFiltrados.map((g, i) => {
          const n = contarCeldas(g);
          return (
            <button key={g.nombre} onClick={() => setTabIndex(i)}
              style={{
                padding: '6px 14px', borderRadius: 8, border: '1.5px solid',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                borderColor: tabIndex === i ? '#166534' : '#d1d5db',
                background:  tabIndex === i ? '#f0fdf4' : '#fff',
                color:       tabIndex === i ? '#166534' : '#6b7280',
                position: 'relative',
              }}
            >
              {g.nombre}
              <span style={{
                marginLeft: 5, fontSize: 10, padding: '1px 5px', borderRadius: 10,
                background: n > 0 ? '#bbf7d0' : '#f3f4f6',
                color:      n > 0 ? '#166534' : '#9ca3af',
              }}>
                {n}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid del grupo seleccionado */}
      {grupoActual ? (
        <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
          {/* Header del grupo */}
          <div style={{ padding: '10px 16px', background: '#f0fdf4', borderBottom: '1.5px solid #d1fae5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#166534' }}>{grupoActual.nombre}</span>
              <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 10 }}>
                {contarCeldas(grupoActual)} bloques asignados
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>
              Doble clic en una tarjeta para editar · Arrastra para mover
            </div>
          </div>
          <div style={{ padding: '1rem' }}>
            <Grid
              key={grupoActual.nombre}
              grid={grupoActual.grid}
              onChange={handleGridChange}
              docentes={docentes}
            />
          </div>
        </div>
      ) : (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
          Selecciona un grupo
        </div>
      )}

      {/* Botón guardar todo */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
        <div style={{ fontSize: 12, color: '#6b7280', alignSelf: 'center' }}>
          {grupos.reduce((s, g) => s + contarCeldas(g), 0)} bloques en total · {grupos.length} grupos
        </div>
        <button
          disabled={guardando}
          onClick={() => onGuardar(grupos)}
          style={{
            padding: '10px 26px', borderRadius: 8, border: 'none',
            background: guardando ? '#86efac' : '#166534',
            color: '#fff', fontSize: 14, fontWeight: 700, cursor: guardando ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          {guardando ? 'Guardando…' : 'Guardar horarios'}
        </button>
      </div>
    </div>
  );
}
