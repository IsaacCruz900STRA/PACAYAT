import { useEffect, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card       from '../../components/ui/Card';
import Badge      from '../../components/ui/Badge';
import Button     from '../../components/ui/Button';
import Table      from '../../components/ui/Table';
import Modal      from '../../components/ui/Modal';
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [inactiveModalOpen, setInactiveModalOpen] = useState(false);
  const [personalEliminar, setPersonalEliminar] = useState(null);
  const [personalInactivar, setPersonalInactivar] = useState(null);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!deleteModalOpen && !inactiveModalOpen) return;
    if (countdown <= 0) return;

    const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [deleteModalOpen, inactiveModalOpen, countdown]);

  const { data, loading, refetch } = useFetch(() => getPersonal({ q: query, rol: rolFiltro, estado: estadoFiltro }), [query, rolFiltro, estadoFiltro]);
  const personal = data?.personal || [];

  const cambiarEstado = async (row, active) => {
    if (row.rol === 'ADMIN') {
      showToast('El administrador no puede ser desactivado', 'error');
      return;
    }

    if (!active) {
      setPersonalInactivar(row);
      setCountdown(10);
      setInactiveModalOpen(true);
      return;
    }

    try {
      await updatePersonal(row.id, { activo: active });
      showToast('Personal activado');
      refetch();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al actualizar estado', 'error');
    }
  };

  const eliminar = (row) => {
    if (row.rol === 'ADMIN') {
      showToast('El administrador no puede ser eliminado', 'error');
      return;
    }

    setPersonalEliminar(row);
    setCountdown(10);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setPersonalEliminar(null);
    setCountdown(10);
  };

  const closeInactiveModal = () => {
    setInactiveModalOpen(false);
    setPersonalInactivar(null);
    setCountdown(10);
  };

  const confirmarEliminarPersonal = async () => {
    if (!personalEliminar) return;
    try {
      await deletePersonal(personalEliminar.id);
      showToast('Personal eliminado');
      refetch();
      closeDeleteModal();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al eliminar personal', 'error');
    }
  };

  const confirmarInactivarPersonal = async () => {
    if (!personalInactivar) return;
    try {
      await updatePersonal(personalInactivar.id, { activo: false });
      showToast('Personal desactivado');
      refetch();
      closeInactiveModal();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al desactivar personal', 'error');
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
      render: (_, row) => <StatusToggle active={row.activo} disabled={row.rol === 'ADMIN'} onChange={(active) => cambiarEstado(row, active)} /> },
    { key: 'id', label: 'Acciones', width: 110,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <ActionBtn title="Editar" color="var(--blue-600)" onClick={() => { setPersonalEdit(row); setModalOpen(true); }}>✏️</ActionBtn>
          <ActionBtn title="Eliminar" color="var(--red-500)" onClick={() => eliminar(row)} disabled={row.rol === 'ADMIN'}>✕</ActionBtn>
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

      <Modal open={deleteModalOpen} onClose={closeDeleteModal} title="Eliminar personal" width={520}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ color: 'var(--red-700)', fontWeight: 700 }}>Advertencia</div>
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Estás a punto de quitar a este/a este personal del sistema. Confirma que deseas continuar con la eliminación.
          </div>
          {personalEliminar && (
            <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: '#fef2f2' }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Personal</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{personalEliminar.nombre}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 14 }}>
                <div><strong>Rol:</strong> {ROL_LABEL[personalEliminar.rol] || personalEliminar.rol}</div>
                <div><strong>Teléfono:</strong> {personalEliminar.telefono || '—'}</div>
                <div><strong>Estado:</strong> {personalEliminar.activo ? 'Activo' : 'Inactivo'}</div>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Button variant="outline" onClick={closeDeleteModal}>Cancelar</Button>
            <Button variant="danger" onClick={confirmarEliminarPersonal} disabled={countdown > 0}>
              {countdown > 0 ? `Aceptar en ${countdown}s` : 'Aceptar y eliminar'}
            </Button>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Debes esperar {countdown} segundos antes de confirmar para asegurarte de que leíste el aviso.
          </div>
        </div>
      </Modal>

      <Modal open={inactiveModalOpen} onClose={closeInactiveModal} title="Desactivar personal" width={520}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ color: 'var(--yellow-700)', fontWeight: 700 }}>⚠ Advertencia</div>
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Estás a punto de desactivar a este/a este personal. Una vez desactivado, no tendrá acceso al sistema pero sus datos se conservarán.
          </div>
          {personalInactivar && (
            <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: '#fffbeb' }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Personal</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{personalInactivar.nombre}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 14 }}>
                <div><strong>Rol:</strong> {ROL_LABEL[personalInactivar.rol] || personalInactivar.rol}</div>
                <div><strong>Teléfono:</strong> {personalInactivar.telefono || '—'}</div>
                <div><strong>Estado:</strong> {personalInactivar.activo ? 'Activo' : 'Inactivo'}</div>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Button variant="outline" onClick={closeInactiveModal}>Cancelar</Button>
            <Button variant="warning" onClick={confirmarInactivarPersonal} disabled={countdown > 0}>
              {countdown > 0 ? `Confirmar en ${countdown}s` : 'Confirmar desactivación'}
            </Button>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Debes esperar {countdown} segundos antes de confirmar para asegurarte de que leíste el aviso.
          </div>
        </div>
      </Modal>

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

function ActionBtn({ children, title, color, onClick, disabled = false }) {
  return (
    <button title={title} onClick={disabled ? undefined : onClick} disabled={disabled} style={{
      background: 'none', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
      padding: '4px 6px', borderRadius: 6, color, fontSize: 15, opacity: disabled ? 0.5 : 1,
    }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'var(--bg-hover)'; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = ''; }}>
      {children}
    </button>
  );
}
