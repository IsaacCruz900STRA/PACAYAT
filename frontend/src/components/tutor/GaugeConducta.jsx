// src/components/tutor/GaugeConducta.jsx
import { nivelInfo } from '../../pages/tutor/_shared';

export default function GaugeConducta({ puntos = 100, size = 180 }) {
  const r     = size * 0.37;
  const cx    = size / 2;
  const cy    = size * 0.57;
  const circ  = Math.PI * r;
  const prog  = Math.min(100, Math.max(0, puntos)) / 100;
  const { label, color, bg, msg } = nivelInfo(puntos);

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size * 0.65} style={{ overflow: 'visible' }}>
        {/* Track */}
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="#e5e7eb" strokeWidth={size * 0.09} strokeLinecap="round" />
        {/* Progress */}
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke={color} strokeWidth={size * 0.09} strokeLinecap="round"
          strokeDasharray={`${prog * circ} ${circ}`}
          style={{ transition: 'stroke-dasharray 0.7s ease' }} />
        {/* Número */}
        <text x={cx} y={cy - 4} textAnchor="middle"
          style={{ fontSize: size * 0.21, fontWeight: 700, fill: color, fontFamily: 'DM Sans, sans-serif' }}>
          {puntos}
        </text>
        <text x={cx} y={cy + size * 0.11} textAnchor="middle"
          style={{ fontSize: size * 0.1, fill: '#9ca3af', fontFamily: 'DM Sans, sans-serif' }}>
          de 100
        </text>
      </svg>
      <div style={{ marginTop: 4 }}>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 2 }}>Puntos de conducta</div>
        <div style={{ fontSize: 16, fontWeight: 700, color }}>{label}</div>
      </div>
      <div style={{
        marginTop: 14, padding: '12px 16px', background: bg,
        borderRadius: 'var(--radius)', fontSize: 14,
        color: 'var(--text-primary)', lineHeight: 1.5,
      }}>
        {msg}
      </div>
    </div>
  );
}
