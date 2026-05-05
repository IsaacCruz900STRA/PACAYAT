// src/pages/directivo/Avisos.jsx
import { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card       from '../../components/ui/Card';

const AVISOS_MOCK = [
  {
    id: 1, tipo: 'CONDUCTA',
    titulo: 'Alumno en riesgo: Juan Pérez García',
    corto: 'El alumno Juan Pérez García del grupo 1º A ha bajado a 58 puntos de conducta. Se recomienda contactar al tutor María Gar...',
    largo: 'El alumno Juan Pérez García del grupo 1º A ha bajado a 58 puntos de conducta. Se recomienda contactar al tutor María García inmediatamente y programar una reunión de seguimiento.',
    hora: 'Hoy, 9:15 AM',
    destinatarios: 'Tutor, Prefecto, Director',
  },
  {
    id: 2, tipo: 'CONDUCTA',
    titulo: 'Alerta: Miguel Díaz Rodríguez',
    corto: 'El alumno Miguel Díaz Rodríguez del grupo 3º C ha alcanzado 38 puntos de conducta (nivel crítico). Se ha programado reun...',
    largo: 'El alumno Miguel Díaz Rodríguez del grupo 3º C ha alcanzado 38 puntos de conducta (nivel crítico). Se ha programado reunión urgente con dirección y familia para el próximo lunes.',
    hora: 'Hoy, 8:30 AM',
    destinatarios: 'Tutor, Prefecto, Orientador',
  },
  {
    id: 3, tipo: 'PERIODO',
    titulo: 'Periodo de Evaluación 2 abierto para captura',
    corto: 'El periodo de evaluación "Marzo-Abril 2026" está activo. Los docentes pueden capturar calificaciones...',
    largo: 'El periodo de evaluación "Marzo-Abril 2026" está activo. Los docentes pueden capturar calificaciones hasta el 30 de abril de 2026.',
    hora: 'Hoy, 7:00 AM',
    destinatarios: 'Todos los docentes',
  },
  {
    id: 4, tipo: 'CONDUCTA',
    titulo: 'Alumno en riesgo: Laura Ramírez Cruz',
    corto: 'La alumna Laura Ramírez Cruz del grupo 3º B presenta 55 puntos de conducta y 7 faltas acumuladas...',
    largo: 'La alumna Laura Ramírez Cruz del grupo 3º B presenta 55 puntos de conducta y 7 faltas acumuladas. Se sugiere intervención preventiva antes de que llegue al umbral crítico.',
    hora: 'Ayer, 3:00 PM',
    destinatarios: 'Tutor, Prefecto',
  },
  {
    id: 5, tipo: 'REINSCRIPCION',
    titulo: 'Periodo de reinscripción próximo',
    corto: 'El periodo de reinscripción 2026-2027 iniciará el 1 de mayo. Se notificó a todos los tutores...',
    largo: 'El periodo de reinscripción 2026-2027 iniciará el 1 de mayo y cerrará el 15 de mayo. Se notificó a todos los tutores vía correo y WhatsApp.',
    hora: 'Ayer, 10:00 AM',
    destinatarios: 'Tutores',
  },
  {
    id: 6, tipo: 'INFORMATIVO',
    titulo: 'Reunión de academia — Viernes',
    corto: 'Se convoca a reunión de academia el viernes 2 de mayo a las 14:00 hrs en sala de juntas...',
    largo: 'Se convoca a reunión de academia el viernes 2 de mayo a las 14:00 hrs en sala de juntas. Temas: revisión de avances curriculares y planeación del siguiente periodo.',
    hora: 'Hace 2 días',
    destinatarios: 'Docentes',
  },
  {
    id: 7, tipo: 'PERIODO',
    titulo: 'Recordatorio: cierre de calificaciones el 30 de abril',
    corto: 'Quedan 5 días para el cierre del periodo de evaluación. Verifica que todos tus grupos tengan calificaciones...',
    largo: 'Quedan 5 días para el cierre del periodo de evaluación. Verifica que todos tus grupos tengan calificaciones capturadas. Los registros sin calificación se marcarán como NP.',
    hora: 'Hace 2 días',
    destinatarios: 'Todos los docentes',
  },
  {
    id: 8, tipo: 'INFORMATIVO',
    titulo: 'Actualización del sistema PACAYAT',
    corto: 'Se realizarán mejoras al sistema el sábado 4 de mayo de 22:00 a 02:00 hrs...',
    largo: 'Se realizarán mejoras al sistema el sábado 4 de mayo de 22:00 a 02:00 hrs. Durante este tiempo el sistema no estará disponible.',
    hora: 'Hace 3 días',
    destinatarios: 'Todos los usuarios',
  },
];

const TIPO_CONFIG = {
  CONDUCTA:     { border: '#ef4444', bg: '#fef2f2', iconBg: '#fee2e2', icon: '⚠️', label: 'Conducta'      },
  PERIODO:      { border: '#f59e0b', bg: '#fffbeb', iconBg: '#fef3c7', icon: '🔔', label: 'Periodos'      },
  REINSCRIPCION:{ border: '#f97316', bg: '#fff7ed', iconBg: '#ffedd5', icon: '📋', label: 'Reinscripción' },
  INFORMATIVO:  { border: '#22c55e', bg: '#f0fdf4', iconBg: '#dcfce7', icon: 'ℹ',  label: 'Informativos'  },
};

const FILTROS = ['Todos', 'Conducta', 'Periodos', 'Reinscripción', 'Informativos'];
const TIPO_MAP = {
  Conducta: 'CONDUCTA', Periodos: 'PERIODO',
  'Reinscripción': 'REINSCRIPCION', Informativos: 'INFORMATIVO',
};

function AvisoCard({ aviso }) {
  const [expandido, setExpandido] = useState(false);
  const cfg = TIPO_CONFIG[aviso.tipo] || TIPO_CONFIG.INFORMATIVO;

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{
        borderLeft: `4px solid ${cfg.border}`,
        border: `1px solid ${cfg.border}`,
        borderLeftWidth: 4,
        background: cfg.bg,
        borderRadius: 'var(--radius-lg)',
        padding: '1.1rem 1.25rem',
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {/* Icono */}
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: cfg.iconBg, border: `1.5px solid ${cfg.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>
            {cfg.icon}
          </div>

          {/* Contenido */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {aviso.titulo}
              </h3>
              {/* Acciones */}
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-secondary)', padding: '2px 4px' }}>✏️</button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--red-500)', padding: '2px 4px' }}>🗑️</button>
              </div>
            </div>

            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.55 }}>
              {expandido ? aviso.largo : aviso.corto}
            </p>

            <button onClick={() => setExpandido(e => !e)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--green-700)', fontSize: 13, fontWeight: 600,
              padding: '4px 0', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              {expandido ? 'Ver menos ∧' : 'Ver más ∨'}
            </button>

            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{aviso.hora}</div>
          </div>
        </div>
      </div>

      {/* Destinatarios — fuera de la card, debajo */}
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', paddingLeft: 8, marginTop: 6 }}>
        <strong>Destinatarios:</strong> {aviso.destinatarios}
      </div>
    </div>
  );
}

export default function DirectivoAvisos() {
  const [filtro, setFiltro] = useState('Todos');

  const filtrados = filtro === 'Todos'
    ? AVISOS_MOCK
    : AVISOS_MOCK.filter(a => a.tipo === TIPO_MAP[filtro]);

  // Conteos por tipo
  const conteos = Object.fromEntries(
    Object.entries(TIPO_MAP).map(([k, v]) => [k, AVISOS_MOCK.filter(a => a.tipo === v).length])
  );

  const tabStyle = (activo) => ({
    padding: '7px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
    fontWeight: activo ? 700 : 500, border: '1.5px solid transparent',
    fontFamily: 'inherit', transition: 'all var(--transition)',
    background: activo ? 'var(--green-700)' : '#f3f4f6',
    color:      activo ? '#fff' : 'var(--text-secondary)',
  });

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader title="Gestión de Avisos" subtitle={`Avisos activos: ${AVISOS_MOCK.length}`} />

      {/* Filtros */}
      <Card style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)', marginRight: 4 }}>
            🔽 Filtrar por tipo:
          </span>
          {FILTROS.map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={tabStyle(filtro === f)}>
              {f === 'Todos'
                ? `Todos (${AVISOS_MOCK.length})`
                : `${f} (${conteos[f] || 0})`}
            </button>
          ))}
        </div>
      </Card>

      {/* Lista de avisos */}
      <div>
        {filtrados.map(a => <AvisoCard key={a.id} aviso={a} />)}
        {filtrados.length === 0 && (
          <Card style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No hay avisos de tipo "{filtro}".
          </Card>
        )}
      </div>
    </div>
  );
}