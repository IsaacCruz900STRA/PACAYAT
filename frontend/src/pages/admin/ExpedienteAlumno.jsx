import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import { showToast } from '../../components/ui/Toast';
import ModalAlumno from '../../components/alumnos/ModalAlumno';
import { getAlumno } from '../../api/alumnos.api';
import { getCalificaciones } from '../../api/calificaciones.api';
import { getReportes } from '../../api/reportes.api';
import { formatDate, formatDateTime } from '../../utils/formatters';

const TABS = ['informacion', 'calificaciones', 'reportes'];

const labelTabs = {
  informacion: 'Información',
  calificaciones: 'Calificaciones',
  reportes: 'Reportes',
};

export default function ExpedienteAlumno() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('informacion');
  const [alumno, setAlumno] = useState(null);
  const [calificaciones, setCalificaciones] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const grupoActivo = alumno?.inscripciones?.[0]?.grupo?.nombre || '—';
  const periodoActivo = alumno?.inscripciones?.[0]?.periodoEscolar?.nombre || '—';

  const cargarExpediente = async () => {
    setLoading(true);
    try {
      const [alumnoRes, calificacionesRes, reportesRes] = await Promise.all([
        getAlumno(id),
        getCalificaciones({ idAlumno: id }),
        getReportes({ idAlumno: id, limit: 100 }),
      ]);
      setAlumno(alumnoRes.data);
      setCalificaciones(calificacionesRes.data?.calificaciones || []);
      setReportes(reportesRes.data?.reportes || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al cargar expediente', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarExpediente();
  }, [id]);

  const promedio = useMemo(() => {
    if (!calificaciones.length) return '—';
    const total = calificaciones.reduce((sum, item) => sum + Number(item.calificacion || 0), 0);
    return (total / calificaciones.length).toFixed(1);
  }, [calificaciones]);

  const volver = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/admin/alumnos');
  };

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Cargando expediente...</div>;
  }

  if (!alumno) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Alumno no encontrado.</div>;
  }

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader
        title="Expediente del Alumno"
        subtitle={`${alumno.nombreCompleto} · ${alumno.matricula}`}
        action={<Button onClick={() => setModalOpen(true)} icon={<Pencil size={14} />}>Editar información</Button>}
      />

      <button
        type="button"
        onClick={volver}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10,
          color: 'var(--green-700)', fontWeight: 600, fontSize: 14,
          border: 'none', background: 'transparent', padding: 0, cursor: 'pointer',
        }}
      >
        <ArrowLeft size={18} /> Volver
      </button>

      <Card style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(3, minmax(120px, 1fr))', gap: 16, alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 24, marginBottom: 4 }}>{alumno.nombreCompleto}</h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Matrícula {alumno.matricula}</div>
          </div>
          <Metric label="Grupo" value={grupoActivo} />
          <Metric label="Conducta" value={`${alumno.puntosConducta} pts`} />
          <Metric label="Promedio" value={promedio} />
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 14px',
              border: 'none',
              borderBottom: activeTab === tab ? '3px solid var(--green-700)' : '3px solid transparent',
              background: 'transparent',
              color: activeTab === tab ? 'var(--green-700)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {labelTabs[tab]}
          </button>
        ))}
      </div>

      {activeTab === 'informacion' && (
        <Informacion alumno={alumno} grupoActivo={grupoActivo} periodoActivo={periodoActivo} onEdit={() => setModalOpen(true)} />
      )}
      {activeTab === 'calificaciones' && <Calificaciones calificaciones={calificaciones} />}
      {activeTab === 'reportes' && <Reportes reportes={reportes} />}

      <ModalAlumno
        open={modalOpen}
        alumno={alumno}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          cargarExpediente();
        }}
      />
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function Informacion({ alumno, grupoActivo, periodoActivo, onEdit }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
      <Card>
        <SectionTitle title="Información del alumno" action={<Button size="sm" variant="outline" onClick={onEdit}>Editar</Button>} />
        <InfoGrid items={[
          ['Nombre', alumno.nombreCompleto],
          ['Matrícula', alumno.matricula],
          ['CURP', alumno.curp],
          ['Fecha de nacimiento', formatDate(alumno.fechaNacimiento)],
          ['Domicilio', alumno.domicilio],
          ['Grupo', grupoActivo],
          ['Periodo escolar', periodoActivo],
          ['Estado', alumno.activo ? 'Activo' : 'Inactivo'],
        ]} />
      </Card>
      <Card>
        <SectionTitle title="Tutor" />
        <InfoGrid items={[
          ['Nombre', alumno.tutor?.nombreCompleto],
          ['Teléfono', alumno.tutor?.telefono],
          ['Correo', alumno.tutor?.correo],
        ]} />
      </Card>
    </div>
  );
}

function SectionTitle({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <h3 style={{ fontSize: 16 }}>{title}</h3>
      {action}
    </div>
  );
}

function InfoGrid({ items }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {items.map(([label, value]) => (
        <div key={label}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{value || '—'}</div>
        </div>
      ))}
    </div>
  );
}

function Calificaciones({ calificaciones }) {
  const columns = [
    { key: 'materia', label: 'Materia' },
    { key: 'periodo', label: 'Periodo', width: 150 },
    { key: 'docente', label: 'Docente' },
    { key: 'calificacion', label: 'Calificación', width: 130, render: v => <Badge variant={v >= 6 ? 'success' : 'danger'}>{Number(v).toFixed(1)}</Badge> },
    { key: 'actualizadoEn', label: 'Actualizada', width: 150, render: v => formatDate(v) },
  ];

  return (
    <Card padding={0}>
      <Table columns={columns} data={calificaciones} emptyMessage="Sin calificaciones registradas" />
    </Card>
  );
}

function Reportes({ reportes }) {
  return (
    <Card>
      <div style={{ display: 'grid', gap: 10, maxHeight: 520, overflowY: 'auto', paddingRight: 6 }}>
        {reportes.length === 0 ? (
          <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Sin reportes registrados.</div>
        ) : reportes.map(reporte => (
          <ReporteItem key={reporte.id} reporte={reporte} />
        ))}
      </div>
    </Card>
  );
}

function ReporteItem({ reporte }) {
  const esNegativo = reporte.tipo === 'NEGATIVO';
  const delta = reporte.puntosDespues - reporte.puntosAntes;

  return (
    <div style={{
      borderLeft: `4px solid ${esNegativo ? 'var(--red-500)' : 'var(--green-500)'}`,
      borderRadius: '0 var(--radius) var(--radius) 0',
      background: esNegativo ? 'var(--red-50)' : 'var(--green-50)',
      padding: '12px 14px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700 }}>{reporte.descripcion}</div>
          <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
            {formatDateTime(reporte.creadoEn)} · {reporte.usuarioReporta?.nombre || '—'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Badge variant={esNegativo ? 'danger' : 'success'}>{esNegativo ? 'Negativo' : 'Positivo'}</Badge>
          <div style={{ marginTop: 8, fontWeight: 800, color: esNegativo ? 'var(--red-600)' : 'var(--green-700)' }}>
            {delta > 0 ? '+' : ''}{delta} pts
          </div>
        </div>
      </div>
    </div>
  );
}
