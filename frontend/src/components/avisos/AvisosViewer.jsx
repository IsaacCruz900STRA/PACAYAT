// src/components/avisos/AvisosViewer.jsx
// Lector de avisos compartido por roles que solo visualizan (Docente, Tutor, Prefecto, Control Escolar)
import { useState, useEffect, useCallback } from 'react';
import { Bell, Clock, Users, ChevronDown, ChevronUp } from 'lucide-react';
import Card       from '../ui/Card';
import PageHeader from '../layout/PageHeader';
import { showToast } from '../ui/Toast';
import { getAvisos }  from '../../api/avisos.api';
import { getPeriodos } from '../../api/periodos.api';

// ── Estilos por tipo ──────────────────────────────────────────────
const TIPO_STYLE = {
  CONDUCTA:           { border: '#ef4444', bg: '#fff5f5', badgeBg: '#fee2e2', badgeColor: '#991b1b', label: 'Conducta'      },
  PERIODO_EVALUACION: { border: '#3b82f6', bg: '#eff6ff', badgeBg: '#dbeafe', badgeColor: '#1e40af', label: 'Evaluación'    },
  REINSCRIPCION:      { border: '#f59e0b', bg: '#fffbeb', badgeBg: '#fef3c7', badgeColor: '#92400e', label: 'Reinscripción' },
  GENERAL:            { border: '#22c55e', bg: '#f0fdf4', badgeBg: '#dcfce7', badgeColor: '#166534', label: 'General'       },
  COLABORADORES:      { border: '#8b5cf6', bg: '#f5f3ff', badgeBg: '#ede9fe', badgeColor: '#5b21b6', label: 'Colaboradores' },
};

const DESTINATARIO_LABEL = {
  CONDUCTA:           'Tutores',
  REINSCRIPCION:      'Tutores',
  GENERAL:            'Todos',
  PERIODO_EVALUACION: 'Tutores y Docentes',
  COLABORADORES:      'Solo personal',
};

// ── Reglas de visibilidad ─────────────────────────────────────────
export function esAvisoVisible(aviso, periodos) {
  if (!aviso.activo) return false;
  const ahora = new Date();

  if (aviso.tipo === 'PERIODO_EVALUACION') {
    return periodos.some(p => {
      if (!p.fechaInicio || !p.fechaFin) return false;
      const ini = new Date(p.fechaInicio); ini.setHours(0, 0, 0, 0);
      const fin = new Date(p.fechaFin);    fin.setHours(23, 59, 59, 999);
      const tresAntes = new Date(ini);
      tresAntes.setDate(ini.getDate() - 3);
      return ahora >= tresAntes && ahora <= fin;
    });
  }

  if (aviso.tipo === 'REINSCRIPCION') {
    // Visibilidad controlada por activo hasta que se integren fechas de reinscripción en BD
    return true;
  }

  // CONDUCTA y GENERAL: visibles 3 días desde su creación
  const limite = new Date(aviso.creadoEn);
  limite.setDate(limite.getDate() + 3);
  return ahora <= limite;
}

export function hayAvisosNuevos(avisosVisibles) {
  const dosHoras = 2 * 60 * 60 * 1000;
  const ahora    = Date.now();
  return avisosVisibles.some(a => ahora - new Date(a.creadoEn).getTime() <= dosHoras);
}

// ── Helpers de fecha ──────────────────────────────────────────────
function fmtFecha(iso) {
  if (!iso) return '';
  const d    = new Date(iso);
  const hoy  = new Date();
  const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
  const misma = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();
  const hora = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  if (misma(d, hoy))  return `Hoy, ${hora}`;
  if (misma(d, ayer)) return `Ayer, ${hora}`;
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) + `, ${hora}`;
}

// ── Tarjeta individual de aviso ───────────────────────────────────
function AvisoCard({ aviso }) {
  const [expandido, setExpandido] = useState(false);
  const st = TIPO_STYLE[aviso.tipo] || TIPO_STYLE.GENERAL;
  const mensajeLargo  = aviso.mensaje?.length > 160;
  const mensajeMostrado = expandido || !mensajeLargo
    ? aviso.mensaje
    : aviso.mensaje.slice(0, 160) + '…';

  return (
    <div style={{
      border: `1px solid ${st.border}`, borderLeftWidth: 4,
      borderRadius: 'var(--radius-lg)', padding: '1.25rem',
      background: st.bg,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Título + badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>{aviso.titulo}</span>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
              background: st.badgeBg, color: st.badgeColor,
            }}>{st.label}</span>
          </div>

          {/* Mensaje */}
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 8px', lineHeight: 1.6 }}>
            {mensajeMostrado}
          </p>
          {mensajeLargo && (
            <button onClick={() => setExpandido(e => !e)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--green-700)', fontSize: 13, fontWeight: 600,
              padding: 0, fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 8,
            }}>
              {expandido ? <><ChevronUp size={14} /> Ver menos</> : <><ChevronDown size={14} /> Ver más</>}
            </button>
          )}

          {/* Meta */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> {fmtFecha(aviso.creadoEn)}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Users size={12} /> {DESTINATARIO_LABEL[aviso.tipo] || 'Todos'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────
export default function AvisosViewer({ tiposPermitidos }) {
  const [avisos,   setAvisos]   = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [avsRes, perRes] = await Promise.all([getAvisos(), getPeriodos()]);
      setAvisos(avsRes.data?.avisos || []);
      setPeriodos(perRes.data?.periodos || []);
    } catch {
      showToast('Error al cargar avisos', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const visibles = avisos
    .filter(a => tiposPermitidos.includes(a.tipo) && esAvisoVisible(a, periodos))
    .sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn));

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <PageHeader
        title="Avisos"
        subtitle={loading ? 'Cargando...' : `${visibles.length} aviso${visibles.length !== 1 ? 's' : ''} activo${visibles.length !== 1 ? 's' : ''}`}
      />

      {loading ? (
        <Card style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Cargando avisos...
        </Card>
      ) : visibles.length === 0 ? (
        <Card style={{ padding: '3.5rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, color: 'var(--text-muted)' }}>
            <Bell size={40} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            Sin avisos en este momento
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Aquí aparecerán los avisos vigentes cuando la escuela los publique.
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {visibles.map(a => <AvisoCard key={a.id} aviso={a} />)}
        </div>
      )}
    </div>
  );
}
