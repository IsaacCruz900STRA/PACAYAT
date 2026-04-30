// src/pages/tutor/Contacto.jsx
import Card from '../../components/ui/Card';

const INFO = [
  { icon:'📞', iconBg:'#dbeafe', title:'Teléfono',            sub:'Línea principal',   main:{ text:'951 123 4567', color:'#2563eb', size:24 }, extra:['Extensión 101 - Dirección','Extensión 102 - Secretaría'] },
  { icon:'✉️', iconBg:'#dcfce7', title:'Correo Electrónico',  sub:'Email institucional',main:{ text:'secundaria177@oaxaca.edu.mx', color:'#16a34a', size:14 }, extra:['Tiempo de respuesta: 24-48 horas hábiles'] },
  { icon:'📍', iconBg:'#f3e8ff', title:'Dirección',           sub:'Ubicación física',  main:null, extra:['Av. Independencia #123','Col. Centro, C.P. 68000','Oaxaca de Juárez, Oaxaca'] },
  { icon:'🕐', iconBg:'#ffedd5', title:'Horario de Atención', sub:'Lunes a Viernes',   main:null, horario:[{area:'Dirección:',hrs:'8:00 AM - 2:00 PM'},{area:'Secretaría:',hrs:'7:00 AM - 3:00 PM'},{area:'Prefectura:',hrs:'7:00 AM - 3:00 PM'}] },
];

const DIRECTIVOS = [
  { nombre:'Dr. Roberto Sánchez Díaz', rol:'Director',             ext:'101', bg:'#dcfce7' },
  { nombre:'Mtro. Carlos Ramírez',     rol:'Subdirector Académico',ext:'103', bg:'#dbeafe' },
  { nombre:'Laura Torres Méndez',      rol:'Secretaria Escolar',   ext:'102', bg:'#fce7f3' },
];

export default function TutorContacto() {
  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <div style={{
        background: 'linear-gradient(135deg, var(--green-800) 0%, var(--green-600) 100%)',
        borderRadius: 'var(--radius-lg)', padding: '1.75rem 2rem', color: '#fff',
        marginBottom: '1.5rem', marginTop: '1.5rem',
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Contacto de la Escuela</h1>
        <p style={{ fontSize: 14, opacity: 0.85 }}>Secundaria Técnica 177</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {INFO.map(card => (
          <Card key={card.title} style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                {card.icon}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{card.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{card.sub}</div>
              </div>
            </div>
            {card.main && (
              <div style={{ fontSize: card.main.size, fontWeight: 700, color: card.main.color, marginBottom: 8 }}>
                {card.main.text}
              </div>
            )}
            {card.extra?.map((e, i) => (
              <div key={i} style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{e}</div>
            ))}
            {card.horario?.map(h => (
              <div key={h.area} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>{h.area}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{h.hrs}</span>
              </div>
            ))}
          </Card>
        ))}
      </div>

      <Card style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '1.5rem' }}>Personal Directivo</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
          {DIRECTIVOS.map(d => (
            <div key={d.nombre} style={{ textAlign: 'center' }}>
              <div style={{ width: 70, height: 70, borderRadius: '50%', background: d.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 12px' }}>
                👤
              </div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{d.nombre}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{d.rol}</div>
              <div style={{ fontSize: 13, color: '#2563eb', fontWeight: 600, marginTop: 4 }}>Ext. {d.ext}</div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1e40af', marginBottom: 10 }}>¿Necesitas agendar una cita?</div>
        <p style={{ fontSize: 14, color: '#1e40af', lineHeight: 1.6, marginBottom: 10 }}>
          Si deseas agendar una cita con algún docente, orientador o directivo, puedes hacerlo de las siguientes formas:
        </p>
        {['Llamando al teléfono principal y solicitando tu cita','Enviando un correo electrónico con tu solicitud','Acudiendo personalmente a la secretaría escolar'].map(item => (
          <div key={item} style={{ display: 'flex', gap: 8, fontSize: 14, color: '#1e40af', marginBottom: 6 }}>
            <span>·</span><span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
