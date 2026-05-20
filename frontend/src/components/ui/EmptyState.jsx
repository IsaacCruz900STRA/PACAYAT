import { Inbox } from 'lucide-react';

export default function EmptyState({ icon, title = 'Sin datos', description }) {
  const defaultIcon = <Inbox size={40} />;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)',
      textAlign: 'center', gap: 8,
    }}>
      <span style={{ fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon || defaultIcon}</span>
      <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{title}</p>
      {description && <p style={{ fontSize: 14 }}>{description}</p>}
    </div>
  );
}
