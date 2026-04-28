import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader          from '../../components/layout/PageHeader';
import Card                from '../../components/ui/Card';
import Badge               from '../../components/ui/Badge';
import Button              from '../../components/ui/Button';
import Table               from '../../components/ui/Table';
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
  const [grupos, setGrupos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getGrupos().then(r => setGrupos(r.data?.grupos || [])).catch(() => {});
  }, []);

  const { data, loading, refetch } = useFetch(() => getAlumnos({ q: query, grupo, estado }), [query, grupo, estado]);

  const alumnos = data?.alumnos || [];

  const eliminarAlumno = async (alumno) => {
    const confirmed = window.confirm(`¿Estás seguro de eliminar a ${alumno.nombreCompleto}?`);
    if (!confirmed) return;

    try {
      await deleteAlumno(alumno.id);
      showToast('Alumno eliminado');
      refetch();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al eliminar alumno', 'error');
    }
  };

  const cambiarEstado = async (alumno, active) => {
    try {
      await updateAlumno(alumno.id, { activo: active });
      showToast(`Alumno ${active ? 'activado' : 'desactivado'}`);
      refetch();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al actualizar estado', 'error');
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
          <ActionBtn title="Ver expediente" color="var(--green-700)" onClick={() => navigate(`/admin/alumnos/${row.id}`)}>👁</ActionBtn>
          <ActionBtn title="Eliminar" color="var(--red-500)" onClick={() => eliminarAlumno(row)}>✕</ActionBtn>
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

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }}>🔍</span>
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
      padding: '4px 6px', borderRadius: 6,
      color, fontSize: 15, transition: 'background var(--transition)',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = ''}
    >
      {children}
    </button>
  );
}
