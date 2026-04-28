// src/pages/docente/Avisos.jsx
import { useState } from 'react';
import Card       from '../../components/ui/Card';
import PageHeader from '../../components/layout/PageHeader';
import Button     from '../../components/ui/Button';

const AVISOS_MOCK = [
  {
    id: 1, tipo: 'CONDUCTA',
    titulo: 'Alumno en riesgo: Juan Pérez García',
    texto: 'El alumno Juan Pérez García del grupo 1° A ha bajado a 58 puntos de conducta. Se recomienda contactar al tutor Maria Gar...',
    textoCompleto: 'El alumno Juan Pérez García del grupo 1° A ha bajado a 58 puntos de conducta. Se recomienda contactar al tutor Maria García inmediatamente y programar una reunión de seguimiento.',
    hora: 'Hoy, 9:15 AM',
    destinatarios: 'Tutor, Prefecto, Director',
  },
  {
    id: 2, tipo: 'CONDUCTA',
    titulo: 'Alerta: Miguel Díaz Rodríguez',
    texto: 'El alumno Miguel Díaz Rodríguez del grupo 3° C ha alcanzado 38 puntos de conducta (nivel crítico). Se ha programado reun...',
    textoCompleto: 'El alumno Miguel Díaz Rodríguez del grupo 3° C ha alcanzado 38 puntos de conducta (nivel crítico). Se ha programado reunión urgente con dirección y familia para el próximo lunes.',
    hora: 'Hoy, 8:30 AM',
    destinatarios: 'Tutor, Prefecto, Orientador',
  },
  {
    id: 3, tipo: 'PERIODO',
    titulo: 'Periodo de Evaluación 2 abierto para captura',
    texto: 'El periodo de evaluación "Marzo-Abril 2026" está activo. Los docentes pueden capturar calificaciones...',
    textoCompleto: 'El periodo de evaluación "Marzo-Abril 2026" está activo. Los docentes pueden capturar calificaciones hasta el 30 de abril de 2026. Por favor asegúrate de registrar todas las calificaciones antes de la fecha límite.',
    hora: 'Hoy, 7:00 AM',
    destinatarios: 'Todos los docentes',
  },
  {
    id: 4, tipo: 'CONDUCTA',
    titulo: 'Alumno en riesgo: Laura Ramírez',
    texto: 'La alumna Laura Ramírez del grupo 3° C presenta 55 puntos de conducta y 7 faltas acumuladas...',
    textoCompleto: 'La alumna Laura Ramírez del grupo 3° C presenta 55 puntos de conducta y 7 faltas acumuladas en el mes. Se sugiere intervención preventiva antes de que llegue al umbral crítico.',
    hora: 'Ayer, 3:00 PM',
    destinatarios: 'Tutor, Prefecto',
  },
  {
    id: 5, tipo: 'REINSCRIPCION',
    titulo: 'Periodo de reinscripción próximo',
    texto: 'El periodo de reinscripción 2026-2027 iniciará el 1 de mayo. Se notificó a todos los tutores...',
    textoCompleto: 'El periodo de reinscripción 2026-2027 iniciará el 1 de mayo y cerrará el 15 de mayo. Se notificó a todos los tutores vía correo y WhatsApp.',
    hora: 'Ayer, 10:00 AM',
    destinatarios: 'Tutores',
  },
  {
    id: 6, tipo: 'INFORMATIVO',
    titulo: 'Reunión de academia — Viernes',
    texto: 'Se convoca a reunión de academia el viernes 2 de mayo a las 14:00 hrs en sala de juntas...',
    textoCompleto: 'Se convoca a reunión de academia el viernes 2 de mayo a las 14:00 hrs en sala de juntas. Temas: revisión de avances curriculares y planeación del siguiente periodo.',
    hora: 'Hace 2 días',
    destinatarios: 'Docentes de matemáticas',
  },
  {
    id: 7, tipo: 'PERIODO',
    titulo: 'Recordatorio: cierre de calificaciones el 30 de abril',
    texto: 'Quedan 5 días para el cierre del periodo de evaluación. Verifica que todos tus grupos tengan...',
    textoCompleto: 'Quedan 5 días para el cierre del periodo de evaluación. Verifica que todos tus grupos tengan calificaciones capturadas. Los registros sin calificación se marcarán como NP.',
    hora: 'Hace 2 días',
    destinatarios: 'Todos los docentes',
  },
  {
    id: 8, tipo: 'INFORMATIVO',
    titulo: 'Actualización del sistema PACAYAT',
    texto: 'Se realizarán mejoras al sistema el sábado 4 de mayo de 22:00 a 02:00 hrs...',
    textoCompleto: 'Se realizarán mejoras al sistema el sábado 4 de mayo de 22:00 a 02:00 hrs. Durante este tiempo el sistema no estará disponible. Disculpa los inconvenientes.',
    hora: 'Hace 3 días',
    destinatarios: 'Todos los usuarios',
  },
];

const TIPO_CONFIG = {
  CONDUCTA:    { color: '#ef4444', bg: '#fef2f2', badge: { bg: '#fee2e2', fg: '#991b1b' }, icon: '⚠️', label: 'Conducta'     },
  PERIODO:     { color: '#f59e0b', bg: '#fffbeb', badge: { bg: '#fef3c7', fg: '#92400e' }, icon: '🔔', label: 'Periodos'     },
  REINSCRIPCION:{ color:'#f97316', bg:'#fff7ed', badge:{ bg:'#ffedd5', fg:'#c2410c' },    icon: '📋', label: 'Reinscripción'},
  INFORMATIVO: { color: '#22c55e', bg: '#f0fdf4', badge: { bg: '#dcfce7', fg: '#14532d' }, icon: 'ℹ', label: 'Informativos' },
};

const FILTROS = ['Todos', 'Conducta', 'Periodos', 'Reinscripción', 'Informativos'];
const TIPO_MAP = { Conducta:'CONDUCTA', Periodos:'PERIODO', 'Reinscripción':'REINSCRIPCION', Informativos:'INFORMATIVO' };

export default function AvisosDocente() {
  const [filtro,    setFiltro]    = useState('Todos');
  const [expandidos, setExpandidos] = useState({});

  const toggle = (id) => setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));

  const filtrados = filtro === 'Todos'
    ? AVISOS_MOCK
    : AVISOS_MOCK.filter(a => a.tipo === TIPO_MAP[filtro]);

  const conteo = Object.fromEntries(
    Object.entries(TIPO_MAP).map(([k, v]) => [k, AVISOS_MOCK.filter(a => a.tipo === v).length])
  );

  const btnFiltro = (f) => ({
    padding: '7px 16px', borderRadius: 20, fontSize: 13,
    fontWeight: filtro === f ? 700 : 500, cursor: 'pointer',
    border: '1.5px solid transparent', fontFamily: 'inherit',
    transition: 'all var(--transition)',
    ...(filtro === f
      ? { background: 'var(--green-700)', color: '#fff' }
      : { background: '#f3f4f6', color: 'var(--text-secondary)' }
    ),
  });

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader
        title="Gestión de Avisos"
        subtitle={`Avisos activos: ${AVISOS_MOCK.length}`}
      />

      {/* Filtros */}
      <Card style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)', marginRight: 4 }}>🔽 Filtrar por tipo:</span>
          {FILTROS.map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={btnFiltro(f)}>
              {f === 'Todos' ? `Todos (${AVISOS_MOCK.length})` : `${f} (${conteo[f] || 0})`}
            </button>
          ))}
        </div>
      </Card>

      {/* Lista de avisos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtrados.map(aviso => {
          const cfg = TIPO_CONFIG[aviso.tipo] || TIPO_CONFIG.INFORMATIVO;
          const expandido = expandidos[aviso.id];
          return (
            <div key={aviso.id} style={{
              background: cfg.bg,
              border: `1px solid ${cfg.color}`,
              borderLeftWidth: 4,
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                {/* Icono */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: '#fff', border: `1.5px solid ${cfg.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, flexShrink: 0,
                }}>
                  {cfg.icon}
                </div>

                {/* Contenido */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {aviso.titulo}
                    </h3>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-secondary)', padding: '2px 4px' }}>✏️</button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-secondary)', padding: '2px 4px' }}>🗑️</button>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                    {expandido ? aviso.textoCompleto : aviso.texto}
                  </p>

                  <button onClick={() => toggle(aviso.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--green-700)', fontSize: 13, fontWeight: 600,
                    padding: 0, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4,
                    fontFamily: 'inherit',
                  }}>
                    {expandido ? 'Ver menos ∧' : 'Ver más ∨'}
                  </button>

                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{aviso.hora}</div>
                </div>
              </div>

              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${cfg.color}33`, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span style={{ fontWeight: 600 }}>Destinatarios:</span> {aviso.destinatarios}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
