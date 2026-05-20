import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, X, AlertTriangle } from 'lucide-react';
import PageHeader          from '../../components/layout/PageHeader';
import Card                from '../../components/ui/Card';
import Badge               from '../../components/ui/Badge';
import Button              from '../../components/ui/Button';
import Table               from '../../components/ui/Table';
import Modal               from '../../components/ui/Modal';
import ModalAlumno         from '../../components/alumnos/ModalAlumno';
import StatusToggle        from '../../components/ui/StatusToggle';
import { useFetch }        from '../../hooks/useFetch';
import { deleteAlumno, getAlumnos, updateAlumno } from '../../api/alumnos.api';
import { getGrupos } from '../../api/grupos.api';
import { showToast } from '../../components/ui/Toast';

function PtsBadge({ pts }) {
  const variant = pts <= 45 ? 'danger' : pts <= 65 ? 'warning' : 'success';
  return <Badge variant={variant}>{pts} pts</Badge>;
}

export default function ListadoAlumnos() {
  const [query,   setQuery]   = useState('');
  const [grupo,   setGrupo]   = useState('');
  const [estado,  setEstado]  = useState('');
  const [modalAlumnoOpen, setModalAlumnoOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [inactiveModalOpen, setInactiveModalOpen] = useState(false);
  const [alumnoEliminar, setAlumnoEliminar] = useState(null);
  const [alumnoInactivar, setAlumnoInactivar] = useState(null);
  const [countdown, setCountdown] = useState(10);
  const [grupos, setGrupos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getGrupos().then(r => setGrupos(r.data?.grupos || [])).catch(() => {});
  }, []);

  const { data, loading, refetch } = useFetch(() => getAlumnos({ q: query, grupo, estado }), [query, grupo, estado]);

  const alumnos = data?.alumnos || [];

  useEffect(() => {
    if (!deleteModalOpen && !inactiveModalOpen) return;
    if (countdown <= 0) return;

    const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [deleteModalOpen, inactiveModalOpen, countdown]);

  const openDeleteModal = (alumno) => {
    setAlumnoEliminar(alumno);
    setCountdown(10);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setAlumnoEliminar(null);
    setCountdown(5);
  };

  const openInactiveModal = (alumno) => {
    setAlumnoInactivar(alumno);
    setCountdown(10);
    setInactiveModalOpen(true);
  };

  const closeInactiveModal = () => {
    setInactiveModalOpen(false);
    setAlumnoInactivar(null);
    setCountdown(10);
  };

  const confirmarEliminarAlumno = async () => {
    if (!alumnoEliminar) return;

    try {
      await deleteAlumno(alumnoEliminar.id);
      showToast('Alumno eliminado');
      refetch();
      closeDeleteModal();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al eliminar alumno', 'error');
    }
  };

  const cambiarEstado = async (alumno, active) => {
    // Si es para desactivar, pedir confirmación
    if (!active) {
      openInactiveModal(alumno);
      return;
    }

    // Si es para activar, hacer directamente
    try {
      await updateAlumno(alumno.id, { activo: active });
      showToast('Alumno activado');
      refetch();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al actualizar estado', 'error');
    }
  };

  const confirmarInactivarAlumno = async () => {
    if (!alumnoInactivar) return;

    try {
      await updateAlumno(alumnoInactivar.id, { activo: false });
      showToast('Alumno desactivado');
      refetch();
      closeInactiveModal();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al desactivar alumno', 'error');
    }
  };

  const columns = [
    { key: 'matricula',   label: 'Matrícula', width: 100,
      render: (v, row) => <span style={{ color: row.activo ? 'var(--text-secondary)' : 'var(--text-muted)', fontSize: 13 }}>{v}</span> },
    { key: 'nombreCompleto', label: 'Nombre completo',
      render: (v, row) => <span style={{ fontWeight: 500, color: row.activo ? 'var(--text-primary)' : 'var(--text-muted)' }}>{v}</span> },
    { key: 'grupo', label: 'Grupo', width: 90,
      render: v => <Badge variant="success">{v}</Badge> },
    { key: 'puntosConducta', label: 'Puntos', width: 110,
      render: v => <PtsBadge pts={v} /> },
    { key: 'tutor',  label: 'Tutor',
      render: v => <span style={{ color: 'var(--text-secondary)' }}>{v}</span> },
    { key: 'estado', label: 'Estado', width: 120,
      render: (_, row) => <StatusToggle active={row.activo} onChange={(active) => cambiarEstado(row, active)} /> },
    { key: 'id', label: 'Acciones', width: 130,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <ActionBtn title="Ver expediente" color="var(--green-700)" onClick={() => navigate(`/admin/alumnos/${row.id}`)}><Eye size={16} /></ActionBtn>
          <ActionBtn title="Eliminar" color="var(--red-500)" onClick={() => openDeleteModal(row)}><X size={14} /></ActionBtn>
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
        title="Alumnos"
        subtitle="Gestión del alumnado"
      />

      <ModalAlumno
        open={modalAlumnoOpen}
        onClose={() => setModalAlumnoOpen(false)}
        onSaved={() => {
          setModalAlumnoOpen(false);
          refetch();
        }}
      />

      <Modal open={deleteModalOpen} onClose={closeDeleteModal} title="Eliminar alumno" width={520}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ color: 'var(--red-700)', fontWeight: 700 }}>Advertencia</div>
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Estás a punto de quitar a este alumno del sistema. Confirma que deseas continuar con la eliminación.
          </div>
          {alumnoEliminar && (
            <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: '#fef2f2' }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Alumno</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{alumnoEliminar.nombreCompleto}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 14 }}>
                <div><strong>Matrícula:</strong> {alumnoEliminar.matricula}</div>
                <div><strong>Grupo:</strong> {alumnoEliminar.grupo}</div>
                <div><strong>Estado:</strong> {alumnoEliminar.activo ? 'Activo' : 'Inactivo'}</div>
                <div><strong>Puntos:</strong> {alumnoEliminar.puntosConducta}</div>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Button variant="outline" onClick={closeDeleteModal}>Cancelar</Button>
            <Button variant="danger" onClick={confirmarEliminarAlumno} disabled={countdown > 0}>
              {countdown > 0 ? `Aceptar en ${countdown}s` : 'Aceptar y eliminar'}
            </Button>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Debes esperar {countdown} segundos antes de confirmar para asegurarte de que leíste el aviso.
          </div>
        </div>
      </Modal>

      <Modal open={inactiveModalOpen} onClose={closeInactiveModal} title="Desactivar alumno" width={520}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ color: 'var(--yellow-700)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={16} /> Advertencia</div>
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Estás a punto de desactivar a este alumno. Una vez desactivado, el alumno no tendrá acceso al sistema pero sus datos se conservarán.
          </div>
          {alumnoInactivar && (
            <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: '#fffbeb' }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Alumno</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{alumnoInactivar.nombreCompleto}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 14 }}>
                <div><strong>Matrícula:</strong> {alumnoInactivar.matricula}</div>
                <div><strong>Grupo:</strong> {alumnoInactivar.grupo}</div>
                <div><strong>Puntos:</strong> {alumnoInactivar.puntosConducta}</div>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Button variant="outline" onClick={closeInactiveModal}>Cancelar</Button>
            <Button variant="warning" onClick={confirmarInactivarAlumno} disabled={countdown > 0}>
              {countdown > 0 ? `Confirmar en ${countdown}s` : 'Confirmar desactivación'}
            </Button>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Debes esperar {countdown} segundos antes de confirmar para asegurarte de que leíste el aviso.
          </div>
        </div>
      </Modal>
      <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}><Search size={14} /></span>
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre o matrícula..."
            style={{ ...filterStyle, width: '100%', paddingLeft: 36 }}
          />
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
        <Button onClick={() => setModalAlumnoOpen(true)}>+ Nuevo Alumno</Button>
      </div>

      {/* Tabla */}
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
      padding: '6px 10px', borderRadius: 6,
      color, fontSize: 22, transition: 'background var(--transition)',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = ''}
    >
      {children}
    </button>
  );
}
