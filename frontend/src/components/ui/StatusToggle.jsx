export default function StatusToggle({ active, onChange, disabled = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange?.(!active)}
      title={active ? 'Activo' : 'Inactivo'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        border: 'none',
        background: 'transparent',
        color: active ? 'var(--green-700)' : 'var(--text-secondary)',
        fontSize: 12,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.65 : 1,
      }}
    >
      <span style={{
        width: 36,
        height: 20,
        borderRadius: 20,
        padding: 2,
        background: active ? 'var(--green-600)' : '#d1d5db',
        display: 'inline-flex',
        justifyContent: active ? 'flex-end' : 'flex-start',
        transition: 'all var(--transition)',
      }}>
        <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: 'var(--shadow-sm)' }} />
      </span>
      {active ? 'Activo' : 'Inactivo'}
    </button>
  );
}
