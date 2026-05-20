// src/pages/tutor/Inicio.jsx
import { useState }       from 'react';
import { useNavigate }    from 'react-router-dom';
import { Users, User, AlertTriangle, BookOpen, ClipboardList, Info, ArrowRight, Download } from 'lucide-react';
import { useAuth }        from '../../context/AuthContext';
import { useTutor }       from '../../context/TutorContext';
import Card               from '../../components/ui/Card';
import Button             from '../../components/ui/Button';
import SelectorHijo       from '../../components/tutor/SelectorHijo';
import GaugeConducta      from '../../components/tutor/GaugeConducta';
import AvisosNuevosBanner from '../../components/avisos/AvisosNuevosBanner';

const TIPOS_TUTOR = ['CONDUCTA', 'REINSCRIPCION', 'GENERAL'];

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

      {/* Banner de avisos nuevos */}
      <AvisosNuevosBanner tiposPermitidos={TIPOS_TUTOR} avisosPath="/tutor/avisos" />

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
          <div style={{ fontSize: 48, marginBottom: 16, display: 'flex', justifyContent: 'center' }}><Users size={48} /></div>
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
            }}><User size={24} /></div>
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
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertTriangle size={18} /></div>
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
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={18} /></div>
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
            <Button variant="outline" fullWidth icon={<ClipboardList size={14} />} onClick={() => navigate('/tutor/reportes')}>
              Ver Todos los Reportes
            </Button>
            <Button variant="outline" fullWidth icon={<Download size={14} />} onClick={() => alert('Descarga de archivos — próximamente')}>
              Descargar Archivos
            </Button>
          </div>

          {/* Info contacto */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e40af', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Info size={14} /> ¿Necesitas ayuda?
            </div>
            <p style={{ fontSize: 13, color: '#1e40af', lineHeight: 1.6 }}>
              Si tienes dudas sobre el desempeño de tu hijo o quieres agendar una cita con algún maestro, puedes acudir a la dirección de la escuela o llamar al teléfono de contacto.
            </p>
            <button onClick={() => navigate('/tutor/contacto')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: 13, fontWeight: 600, padding: '4px 0', fontFamily: 'inherit' }}>
              Ver datos de Contacto <ArrowRight size={13} style={{ display:'inline', verticalAlign:'middle' }} />
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
