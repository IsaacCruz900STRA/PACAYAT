import { useState } from 'react';
import { Download } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card       from '../../components/ui/Card';
import Button     from '../../components/ui/Button';
import Table      from '../../components/ui/Table';
import { useFetch }      from '../../hooks/useFetch';
import { getAsistencia } from '../../api/asistencia.api';

export default function AsistenciaGeneral() {
  const [grupo,    setGrupo]    = useState('');
  const [materia,  setMateria]  = useState('');
  const [fecha,    setFecha]    = useState('');

  const { data, loading } = useFetch(() => getAsistencia({ grupo, materia, fecha }), []);
  const registros = data?.registros || [];

  const filterStyle = {
    padding: '9px 12px', border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)', fontSize: 14, background: '#fff',
    appearance: 'none', outline: 'none', cursor: 'pointer',
  };

  const columns = [
    { key: 'fecha',   label: 'Fecha',  render: v => <span style={{ color: 'var(--text-secondary)' }}>{v}</span> },
    { key: 'alumno',  label: 'Alumno', render: v => <span style={{ fontWeight: 600 }}>{v}</span> },
    { key: 'grupo',   label: 'Grupo'  },
    { key: 'materia', label: 'Materia', render: v => <span style={{ color: 'var(--text-secondary)' }}>{v}</span> },
    { key: 'docente', label: 'Docente', render: v => <span style={{ color: 'var(--text-secondary)' }}>{v}</span> },
  ];

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader title="Asistencia" subtitle="Consulta de listas de asistencia" />

      <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={grupo} onChange={e => setGrupo(e.target.value)} style={filterStyle}>
          <option value="">Todos los grupos</option>
          <option value="1A">1°A</option><option value="2B">2°B</option>
        </select>
        <select value={materia} onChange={e => setMateria(e.target.value)} style={filterStyle}>
          <option value="">Todas las materias</option>
          <option value="mat">Matemáticas</option><option value="esp">Español</option>
        </select>
        <input type="text" value={fecha} onChange={e => setFecha(e.target.value)}
          placeholder="dd/mm/aaaa" style={{ ...filterStyle, width: 160 }} />
        <Button>Buscar</Button>
        <Button variant="outline" style={{ marginLeft: 'auto' }} icon={<Download size={14} />}>Descargar PDF</Button>
      </div>

      <Card style={{ padding: 0 }}>
        {loading
          ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando...</div>
          : <Table columns={columns} data={registros} emptyMessage="No hay registros de asistencia para los filtros seleccionados" />
        }
      </Card>
    </div>
  );
}
