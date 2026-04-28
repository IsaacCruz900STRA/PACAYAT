import PageHeader from '../../components/layout/PageHeader';

export default function Horarios() {
  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader title="Horarios" subtitle="Gestión de horarios por grupo y docente" />

      <div style={{
        marginTop: '3rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        padding: '4rem 2rem',
        background: '#fff',
        borderRadius: 'var(--radius-lg)',
        border: '2px dashed var(--border)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 52 }}>🚧</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          En construcción
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 400, margin: 0, lineHeight: 1.6 }}>
          La gestión de horarios estará disponible próximamente. Aquí podrás configurar los horarios de cada grupo, asignar salones y consultar la carga horaria de los docentes.
        </p>
        <div style={{
          marginTop: '0.5rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: '#fef3c7',
          color: '#92400e',
          borderRadius: 'var(--radius)',
          padding: '6px 16px',
          fontSize: 13,
          fontWeight: 600,
        }}>
          ⏳ Próxima versión
        </div>
      </div>
    </div>
  );
}
