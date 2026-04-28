import { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card       from '../../components/ui/Card';
import Badge      from '../../components/ui/Badge';
import Button     from '../../components/ui/Button';
import Table      from '../../components/ui/Table';
import StatusToggle from '../../components/ui/StatusToggle';
import ModalPersonal from '../../components/personal/ModalPersonal';
import { useFetch }      from '../../hooks/useFetch';
import { deletePersonal, getPersonal, updatePersonal } from '../../api/personal.api';
import { showToast } from '../../components/ui/Toast';

const ROL_VARIANT = {
  DOCENTE:        'docente',
  ADMINISTRATIVO: 'neutral',
  PREFECTO:       'prefecto',
  SECRETARIA:     'secretaria',
  CONTROL_ESCOLAR:'control',
  DIRECTIVO:      'directivo',
  ADMIN:          'admin',
};
const ROL_LABEL = {
  DOCENTE: 'Docente', PREFECTO: 'Prefecto', SECRETARIA: 'Secretaria',
  ADMINISTRATIVO: 'Administrativo', CONTROL_ESCOLAR: 'Control Escolar',
  DIRECTIVO: 'Directivo', ADMIN: 'Administrador',
};

export default function ListadoPersonal() {
  const [query, setQuery] = useState('');
  const [rolFiltro, setRolFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [personalEdit, setPersonalEdit] = useState(null);

  const { data, loading, refetch } = useFetch(() => getPersonal({ q: query, rol: rolFiltro, estado: estadoFiltro }), [query, rolFiltro, estadoFiltro]);
  const personal = data?.personal || [];

  const cambiarEstado = async (row, active) => {
    try {
      await updatePersonal(row.id, { activo: active });
      showToast(`Personal ${active ? 'activado' : 'desactivado'}`);
      refetch();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al actualizar estado', 'error');
    }
  };

  const eliminar = async (row) => {
    if (!window.confirm(`¿Estás seguro de eliminar a ${row.nombre}?`)) return;
    try {
      await deletePersonal(row.id);
      showToast('Personal eliminado');
      refetch();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al eliminar personal', 'error');
    }
  };

  const filterStyle = {
    padding: '9px 12px', border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)', fontSize: 14, background: '#fff',
    appearance: 'none', outline: 'none', cursor: 'pointer',
  };

  const columns = [
    { key: 'nombre', label: 'Nombre',
      render: (v, row) => <span style={{ fontWeight: 500, color: row.activo ? 'var(--text-primary)' : 'var(--text-muted)' }}>{v}</span> },
    { key: 'rol', label: 'Rol', width: 140,
      render: v => <Badge variant={ROL_VARIANT[v] || 'neutral'}>{ROL_LABEL[v] || v}</Badge> },
    { key: 'telefono', label: 'Teléfono',
      render: v => <span style={{ color: 'var(--text-secondary)' }}>{v}</span> },
    { key: 'estado', label: 'Estado', width: 120,
      render: (_, row) => <StatusToggle active={row.activo} onChange={(active) => cambiarEstado(row, active)} /> },
    { key: 'id', label: 'Acciones', width: 110,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <ActionBtn title="Editar" color="var(--blue-600)" onClick={() => { setPersonalEdit(row); setModalOpen(true); }}>✏️</ActionBtn>
          <ActionBtn title="Eliminar" color="var(--red-500)" onClick={() => eliminar(row)}>✕</ActionBtn>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader title="Personal" subtitle="Gestión del personal escolar"
        action={<Button onClick={() => { setPersonalEdit(null); setModalOpen(true); }}>+ Nuevo Personal</Button>} />

      <ModalPersonal
        open={modalOpen}
        personal={personalEdit}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          setPersonalEdit(null);
          refetch();
        }}
      />

      <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }}>🔍</span>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre..."
            style={{ ...filterStyle, width: '100%', paddingLeft: 36 }} />
        </div>
        <select value={rolFiltro} onChange={e => setRolFiltro(e.target.value)} style={filterStyle}>
          <option value="">Todos los roles</option>
          {Object.entries(ROL_LABEL).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)} style={filterStyle}>
          <option value="">Todos</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>

      <Card style={{ padding: 0 }}>
        {loading
          ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando...</div>
          : <Table columns={columns} data={personal}
              emptyMessage="No hay personal registrado"
              footer={`Mostrando ${personal.length} de ${data?.total || personal.length} personal`} />
        }
      </Card>
    </div>
  );
}

function ActionBtn({ children, title, color, onClick }) {
  return (
    <button title={title} onClick={onClick} style={{
      background: 'none', border: 'none', cursor: 'pointer',
      padding: '4px 6px', borderRadius: 6, color, fontSize: 15,
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = ''}>
      {children}
    </button>
  );
}
