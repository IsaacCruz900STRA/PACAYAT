// src/components/tutor/GaugeConducta.jsx
// Medidor visual de puntos de conducta orientado al tutor.

function nivelInfo(pts) {
  if (pts >= 85) return { label: 'Excelente',    msg: '¡Excelente! Tu hijo está teniendo un muy buen desempeño en conducta.',        color: '#16a34a', bg: '#f0fdf4' };
  if (pts >= 70) return { label: 'Bueno',        msg: 'Tu hijo tiene un buen comportamiento. Sigue así.',                            color: '#2563eb', bg: '#eff6ff' };
  if (pts >= 60) return { label: 'Regular',      msg: 'El comportamiento puede mejorar. Te recomendamos platicar con tu hijo.',       color: '#d97706', bg: '#fffbeb' };
  if (pts >= 45) return { label: 'En riesgo',    msg: 'Tu hijo necesita mejorar su conducta. Por favor contacta a la escuela.',       color: '#ea580c', bg: '#fff7ed' };
  return          { label: 'Atención urgente',   msg: 'Situación crítica. Te pedimos contactar a la escuela a la brevedad posible.', color: '#dc2626', bg: '#fef2f2' };
}

export default function GaugeConducta({ puntos = 100, size = 180 }) {
  const r   = size * 0.37;
  const cx  = size / 2;
  const cy  = size * 0.57;
  const circ = Math.PI * r;
  const prog = Math.min(100, Math.max(0, puntos)) / 100;
  const { label, msg, color, bg } = nivelInfo(puntos);

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size * 0.65} style={{ overflow: 'visible' }}>
        {/* Track */}
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`}
          fill="none" stroke="#e5e7eb" strokeWidth={size * 0.09} strokeLinecap="round" />
        {/* Progress */}
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`}
          fill="none" stroke={color} strokeWidth={size * 0.09} strokeLinecap="round"
          strokeDasharray={`${prog * circ} ${circ}`}
          style={{ transition: 'stroke-dasharray 0.7s ease, stroke 0.3s' }} />
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
