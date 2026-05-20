// src/pages/secretaria/GestionAlumnos.jsx
// Recicla ModalAlumno y la misma lógica del admin/ListadoAlumnos
import { useState, useEffect } from 'react';
import PageHeader   from '../../components/layout/PageHeader';
import Card         from '../../components/ui/Card';
import Badge        from '../../components/ui/Badge';
import Button       from '../../components/ui/Button';
import Table        from '../../components/ui/Table';
import Modal        from '../../components/ui/Modal';
import ModalAlumno  from '../../components/alumnos/ModalAlumno';
import StatusToggle from '../../components/ui/StatusToggle';
import { useFetch } from '../../hooks/useFetch';
import { deleteAlumno, getAlumno, getAlumnos, updateAlumno } from '../../api/alumnos.api';
import { getGrupos } from '../../api/grupos.api';
import { showToast } from '../../components/ui/Toast';

function PtsBadge({ pts }) {
  const variant = pts <= 45 ? 'danger' : pts <= 65 ? 'warning' : 'success';
  return <Badge variant={variant}>{pts} pts</Badge>;
}

export default function SecretariaAlumnos() {
  const [query,            setQuery]            = useState('');
  const [grupo,            setGrupo]            = useState('');
  const [estado,           setEstado]           = useState('');
  const [modalAlumnoOpen,  setModalAlumnoOpen]  = useState(false);
  const [alumnoEditar,     setAlumnoEditar]     = useState(null);
  const [deleteModalOpen,  setDeleteModalOpen]  = useState(false);
  const [inactiveModalOpen,setInactiveModalOpen]= useState(false);
  const [alumnoEliminar,   setAlumnoEliminar]   = useState(null);
  const [alumnoInactivar,  setAlumnoInactivar]  = useState(null);
  const [countdown,        setCountdown]        = useState(10);
  const [grupos,           setGrupos]           = useState([]);

  useEffect(() => {
    getGrupos().then(r => setGrupos(r.data?.grupos || [])).catch(() => {});
  }, []);

  const { data, loading, refetch } = useFetch(
    () => getAlumnos({ q: query, grupo, estado }),
    [query, grupo, estado]
  );
  const alumnos = data?.alumnos || [];

  // Countdown para modales de confirmación
  useEffect(() => {
    if (!deleteModalOpen && !inactiveModalOpen) return;
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(p => p - 1), 1000);
    return () => clearTimeout(timer);
  }, [deleteModalOpen, inactiveModalOpen, countdown]);

  const openDeleteModal = (alumno) => {
    setAlumnoEliminar(alumno); setCountdown(10); setDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setDeleteModalOpen(false); setAlumnoEliminar(null); setCountdown(10);
  };
  const openInactiveModal = (alumno) => {
    setAlumnoInactivar(alumno); setCountdown(10); setInactiveModalOpen(true);
  };
  const closeInactiveModal = () => {
    setInactiveModalOpen(false); setAlumnoInactivar(null); setCountdown(10);
  };

  const confirmarEliminar = async () => {
    if (!alumnoEliminar) return;
    try {
      await deleteAlumno(alumnoEliminar.id);
      showToast('Alumno eliminado');
      refetch(); closeDeleteModal();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al eliminar alumno', 'error');
    }
  };

  const cambiarEstado = async (alumno, active) => {
    if (!active) { openInactiveModal(alumno); return; }
    try {
      await updateAlumno(alumno.id, { activo: true });
      showToast('Alumno activado');
      refetch();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al actualizar estado', 'error');
    }
  };

  const confirmarInactivar = async () => {
    if (!alumnoInactivar) return;
    try {
      await updateAlumno(alumnoInactivar.id, { activo: false });
      showToast('Alumno desactivado');
      refetch(); closeInactiveModal();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al desactivar alumno', 'error');
    }
  };

  const abrirEditar = async (alumno) => {
    try {
      const { data } = await getAlumno(alumno.id);
      setAlumnoEditar(data);
    } catch {
      setAlumnoEditar(alumno);
    }
    setModalAlumnoOpen(true);
  };

  const columns = [
    { key: 'matricula',     label: 'Matrícula', width: 100,
      render: (v, row) => <span style={{ color: row.activo ? 'var(--text-secondary)' : 'var(--text-muted)', fontSize: 13 }}>{v}</span> },
    { key: 'nombreCompleto', label: 'Nombre completo',
      render: (v, row) => <span style={{ fontWeight: 500, color: row.activo ? 'var(--text-primary)' : 'var(--text-muted)' }}>{v}</span> },
    { key: 'grupo', label: 'Grupo', width: 90,
      render: v => <Badge variant="success">{v || '—'}</Badge> },
    { key: 'puntosConducta', label: 'Puntos', width: 110,
      render: v => <PtsBadge pts={v} /> },
    { key: 'tutor', label: 'Tutor',
      render: v => <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{v || '—'}</span> },
    { key: 'estado', label: 'Estado', width: 120,
      render: (_, row) => <StatusToggle active={row.activo} onChange={active => cambiarEstado(row, active)} /> },
    { key: 'id', label: 'Acciones', width: 100,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <ActionBtn title="Editar" color="var(--blue-600)" onClick={() => abrirEditar(row)}>✏️</ActionBtn>
          <ActionBtn title="Eliminar" color="var(--red-500)" onClick={() => openDeleteModal(row)}>✕</ActionBtn>
        </div>
      ),
    },
  ];

  const filterStyle = {
    padding: '9px 12px', border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)', fontSize: 14, background: '#fff',
    appearance: 'none', outline: 'none', cursor: 'pointer',
  };

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader
        title="Gestión de Alumnos"
        subtitle={`${data?.total ?? alumnos.length} alumnos registrados`}
      />

      {/* Modal agregar / editar alumno — mismo componente que admin */}
      <ModalAlumno
        open={modalAlumnoOpen}
        alumno={alumnoEditar}
        onClose={() => { setModalAlumnoOpen(false); setAlumnoEditar(null); }}
        onSaved={() => { setModalAlumnoOpen(false); setAlumnoEditar(null); refetch(); }}
      />

      {/* Modal confirmar eliminación */}
      <Modal open={deleteModalOpen} onClose={closeDeleteModal} title="Eliminar alumno" width={520}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ color: 'var(--red-700)', fontWeight: 700 }}>⚠ Advertencia</div>
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Estás a punto de eliminar a este alumno del sistema. Esta acción no se puede deshacer.
          </div>
          {alumnoEliminar && (
            <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: '#fef2f2' }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{alumnoEliminar.nombreCompleto}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 14 }}>
                <div><strong>Matrícula:</strong> {alumnoEliminar.matricula}</div>
                <div><strong>Grupo:</strong> {alumnoEliminar.grupo}</div>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <Button variant="outline" onClick={closeDeleteModal}>Cancelar</Button>
            <Button variant="danger" onClick={confirmarEliminar} disabled={countdown > 0}>
              {countdown > 0 ? `Confirmar en ${countdown}s` : 'Eliminar alumno'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal confirmar desactivación */}
      <Modal open={inactiveModalOpen} onClose={closeInactiveModal} title="Desactivar alumno" width={520}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ color: '#d97706', fontWeight: 700 }}>⚠ Advertencia</div>
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            El alumno quedará inactivo. Sus datos se conservan y puede reactivarse después.
          </div>
          {alumnoInactivar && (
            <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: '#fffbeb' }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{alumnoInactivar.nombreCompleto}</div>
              <div style={{ fontSize: 14 }}><strong>Matrícula:</strong> {alumnoInactivar.matricula} · <strong>Grupo:</strong> {alumnoInactivar.grupo}</div>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <Button variant="outline" onClick={closeInactiveModal}>Cancelar</Button>
            <Button variant="warning" onClick={confirmarInactivar} disabled={countdown > 0}>
              {countdown > 0 ? `Confirmar en ${countdown}s` : 'Desactivar alumno'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Filtros + botón nuevo */}
      <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }}>🔍</span>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre o matrícula..."
            style={{ ...filterStyle, width: '100%', paddingLeft: 36 }} />
        </div>
        <select value={grupo} onChange={e => setGrupo(e.target.value)} style={filterStyle}>
          <option value="">Todos los grupos</option>
          {grupos.map(g => <option key={g.id} value={g.nombre}>{g.nombre}</option>)}
        </select>
        <select value={estado} onChange={e => setEstado(e.target.value)} style={filterStyle}>
          <option value="">Todos</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
        <Button onClick={() => { setAlumnoEditar(null); setModalAlumnoOpen(true); }}>+ Nuevo Alumno</Button>
      </div>

      <Card style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando alumnos...</div>
        ) : (
          <Table
            columns={columns}
            data={alumnos}
            emptyMessage="No se encontraron alumnos con los filtros aplicados"
            footer={`Mostrando ${alumnos.length} de ${data?.total || alumnos.length} alumnos`}
          />
        )}
      </Card>
    </div>
  );
}

function ActionBtn({ children, title, color, onClick }) {
  return (
    <button title={title} onClick={onClick} style={{
      background: 'none', border: 'none', cursor: 'pointer',
      padding: '6px 10px', borderRadius: 6, color, fontSize: 20,
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = ''}
    >{children}</button>
  );
}
