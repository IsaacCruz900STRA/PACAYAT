// src/pages/tutor/Inicio.jsx
import { useState }       from 'react';
import { useNavigate }    from 'react-router-dom';
import { useAuth }        from '../../context/AuthContext';
import { useTutor }       from '../../context/TutorContext';
import Card               from '../../components/ui/Card';
import Button             from '../../components/ui/Button';
import SelectorHijo       from '../../components/tutor/SelectorHijo';
import GaugeConducta      from '../../components/tutor/GaugeConducta';

// ── Avisos estáticos (en producción vendrán del backend) ──────
const AVISOS = [
  {
    tipo: 'danger',
    titulo: 'Atención requerida: Sofía Díaz Morales',
    corto: 'Sofía tiene 58 puntos de conducta. Te recomendamos conversar con ella sobre su comportamiento y contactar a la escuela s...',
    largo: 'Sofía tiene 58 puntos de conducta. Te recomendamos conversar con ella sobre su comportamiento y contactar a la escuela. Puedes agendar una cita en secretaría o llamar al 951 123 4567.',
  },
  {
    tipo: 'warning',
    titulo: 'Periodo de evaluación próximo a cerrar',
    corto: "El periodo de evaluación 'Marzo-Abril 2026' está por terminar. Las calificaciones finales estarán disponibles la próxima semana.",
    largo: "El periodo 'Marzo-Abril 2026' cerrará el 30 de abril. Las calificaciones estarán disponibles en la boleta digital a partir del 5 de mayo.",
  },
];

function AvisoCard({ aviso }) {
  const [expandido, setExpandido] = useState(false);
  const isD = aviso.tipo === 'danger';
  return (
    <div style={{
      borderLeft: `4px solid ${isD ? '#ef4444' : '#f59e0b'}`,
      border: `1px solid ${isD ? '#ef4444' : '#f59e0b'}`,
      borderLeftWidth: 4,
      background: isD ? '#fef2f2' : '#fffbeb',
      borderRadius: 'var(--radius-lg)',
      padding: '1rem 1.25rem',
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: isD ? '#fee2e2' : '#fef3c7',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>
          {isD ? '⚠️' : '🔔'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: isD ? '#991b1b' : '#92400e', marginBottom: 6 }}>
            {aviso.titulo}
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 8 }}>
            {expandido ? aviso.largo : aviso.corto}
          </p>
          <button onClick={() => setExpandido(e => !e)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--green-700)', fontSize: 13, fontWeight: 600,
            padding: 0, fontFamily: 'inherit',
          }}>
            {expandido ? 'Ver menos ∧' : 'Ver más ∨'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
export default function TutorInicio() {
  const { user }                               = useAuth();
  const { hijos, hijoActual, seleccionarHijo, loading } = useTutor();
  const navigate                               = useNavigate();

  const primerNombre = user?.nombre?.split(' ').slice(0, 2).join(' ') || 'Tutor';

  return (
    <div style={{ padding: '0 2rem 2rem' }}>

      {/* Banner bienvenida */}
      <div style={{
        background: 'linear-gradient(135deg, var(--green-800) 0%, var(--green-600) 100%)',
        borderRadius: 'var(--radius-lg)', padding: '1.75rem 2rem', color: '#fff',
        marginBottom: '1.5rem', marginTop: '1.5rem',
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
          ¡Bienvenida, {primerNombre}!
        </h1>
        <p style={{ fontSize: 15, opacity: 0.9 }}>Aquí puedes consultar el progreso de tus hijos</p>
      </div>

      {/* Avisos */}
      <section style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: '1rem' }}>Avisos Importantes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {AVISOS.map((a, i) => <AvisoCard key={i} aviso={a} />)}
        </div>
      </section>

      {/* Selector de hijos */}
      {!loading && hijos.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {hijos.map(h => {
            const active = hijoActual?.id === h.id;
            return (
              <button key={h.id} onClick={() => seleccionarHijo(h)} style={{
                padding: '8px 22px', borderRadius: 'var(--radius)', fontSize: 15,
                fontWeight: active ? 700 : 500, border: '2px solid', cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all var(--transition)',
                borderColor: active ? 'var(--green-700)' : 'var(--border)',
                background:  active ? 'var(--green-700)' : '#fff',
                color:       active ? '#fff' : 'var(--text-secondary)',
              }}>
                {h.nombre.split(' ')[0]}
              </button>
            );
          })}
        </div>
      )}

      {/* Sin hijos registrados */}
      {!loading && hijos.length === 0 && (
        <Card style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👨‍👩‍👧</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Sin alumnos registrados</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            No hay alumnos vinculados a tu cuenta. Contacta a la secretaría escolar para registrar a tus hijos.
          </p>
          <div style={{ marginTop: '1.25rem' }}>
            <Button onClick={() => navigate('/tutor/contacto')}>Ver datos de Contacto</Button>
          </div>
        </Card>
      )}

      {/* Tarjeta del hijo seleccionado */}
      {!loading && hijoActual && (
        <Card style={{ padding: '1.5rem' }}>
          {/* Identidad */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            marginBottom: '1.5rem', paddingBottom: '1.25rem',
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: 'var(--green-700)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, color: '#fff', flexShrink: 0,
            }}>👤</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{hijoActual.nombre}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>
                Grupo: {hijoActual.grupo} &nbsp;·&nbsp; Matrícula: {hijoActual.matricula}
              </div>
            </div>
          </div>

          {/* Gauge conducta */}
          <Card style={{ background: 'var(--green-50)', border: '1px solid var(--green-100)', padding: '1.5rem', marginBottom: '1.25rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: '1rem' }}>Estado de Conducta</h3>
            <GaugeConducta puntos={hijoActual.puntosConducta} size={180} />
          </Card>

          {/* Stats: faltas y promedio */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <Card style={{ border: '1px solid #fed7aa', background: '#fff7ed', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚠️</div>
                <span style={{ fontWeight: 600, fontSize: 15 }}>Faltas Acumuladas</span>
              </div>
              <div style={{
                fontSize: 36, fontWeight: 700, marginBottom: 4,
                color: hijoActual.faltas <= 3 ? 'var(--green-700)' : hijoActual.faltas <= 6 ? '#d97706' : '#dc2626',
              }}>
                {hijoActual.faltas}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {hijoActual.faltas <= 3 ? 'Buena asistencia' : hijoActual.faltas <= 6 ? 'Asistencia regular' : 'Muchas faltas'}
              </div>
            </Card>
            <Card style={{ border: '1px solid #bfdbfe', background: '#eff6ff', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📖</div>
                <span style={{ fontWeight: 600, fontSize: 15 }}>Promedio General</span>
              </div>
              <div style={{
                fontSize: 36, fontWeight: 700, marginBottom: 4,
                color: hijoActual.promedio >= 8 ? 'var(--green-700)' : hijoActual.promedio >= 7 ? '#d97706' : '#dc2626',
              }}>
                {hijoActual.promedio.toFixed(1)}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {hijoActual.promedio >= 8 ? 'Buen desempeño académico' : hijoActual.promedio >= 7 ? 'Desempeño regular' : 'Necesita mejorar'}
              </div>
            </Card>
          </div>

          {/* Acciones */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <Button variant="outline" fullWidth icon="📋" onClick={() => navigate('/tutor/reportes')}>
              Ver Todos los Reportes
            </Button>
            <Button variant="outline" fullWidth icon="⬇" onClick={() => alert('Descarga de archivos — próximamente')}>
              Descargar Archivos
            </Button>
          </div>

          {/* Info contacto */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e40af', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              ℹ️ ¿Necesitas ayuda?
            </div>
            <p style={{ fontSize: 13, color: '#1e40af', lineHeight: 1.6 }}>
              Si tienes dudas sobre el desempeño de tu hijo o quieres agendar una cita con algún maestro, puedes acudir a la dirección de la escuela o llamar al teléfono de contacto.
            </p>
            <button onClick={() => navigate('/tutor/contacto')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: 13, fontWeight: 600, padding: '4px 0', fontFamily: 'inherit' }}>
              Ver datos de Contacto →
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
