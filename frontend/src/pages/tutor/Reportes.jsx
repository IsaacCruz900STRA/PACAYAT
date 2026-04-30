// src/pages/tutor/Reportes.jsx
import { useState }   from 'react';
import { useTutor }   from '../../context/TutorContext';
import Card           from '../../components/ui/Card';
import SelectorHijo   from '../../components/tutor/SelectorHijo';
import GaugeConducta  from '../../components/tutor/GaugeConducta';
import { REPORTES_MOCK, GRAVEDAD_LABEL } from './_shared';

export default function TutorReportes() {
  const { hijoActual, loading, hijos } = useTutor();
  const [filtro, setFiltro] = useState('Todos');

  // TODO: reemplazar con useFetch(getReportesHijo, [hijoActual?.id])
  const reportes = REPORTES_MOCK;
  const filtrados = filtro === 'Todos' ? reportes : reportes.filter(r => r.tipo === filtro);
  const countPos  = reportes.filter(r => r.tipo === 'Positivo').length;
  const countNeg  = reportes.filter(r => r.tipo === 'Negativo').length;

  return (
    <div style={{ padding: '0 2rem 2rem' }}>
      <div style={{ padding: '1.5rem 0 1rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Historial de Reportes</h1>
        {hijoActual && (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            {hijoActual.nombre} &nbsp;·&nbsp; Grupo {hijoActual.grupo}
          </p>
        )}
      </div>

      <SelectorHijo />

      {/* Sin hijos */}
      {!loading && hijos.length === 0 && (
        <Card style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p style={{ fontWeight: 600 }}>Sin alumnos registrados</p>
          <p style={{ fontSize: 14, marginTop: 6 }}>Contacta a la secretaría para vincular a tus hijos.</p>
        </Card>
      )}

      {!loading && hijoActual && (
        <>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--green-800) 0%, var(--green-600) 100%)',
            borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', color: '#fff', marginBottom: '1.25rem',
          }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Historial de Reportes</div>
            <div style={{ fontSize: 14, opacity: 0.85, marginTop: 2 }}>{hijoActual.nombre}</div>
          </div>

          {/* Gauge */}
          <Card style={{ background: 'var(--green-50)', border: '1px solid var(--green-100)', padding: '1.5rem', marginBottom: '1.25rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: '1rem' }}>Estado Actual de Conducta</h3>
            <GaugeConducta puntos={hijoActual.puntosConducta} size={160} />
          </Card>

          {/* Filtros */}
          <Card style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>🔽 Filtrar por tipo:</span>
            {[
              { label: `Todos (${reportes.length})`, val: 'Todos',    bg: 'var(--green-700)' },
              { label: `Positivos (${countPos})`,    val: 'Positivo', bg: '#16a34a' },
              { label: `Negativos (${countNeg})`,    val: 'Negativo', bg: '#ef4444' },
            ].map(f => (
              <button key={f.val} onClick={() => setFiltro(f.val)} style={{
                padding: '6px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                fontWeight: filtro === f.val ? 700 : 500, border: '1.5px solid transparent',
                fontFamily: 'inherit',
                background: filtro === f.val ? f.bg : '#f3f4f6',
                color:      filtro === f.val ? '#fff' : 'var(--text-secondary)',
              }}>{f.label}</button>
            ))}
          </Card>

          {/* Lista de reportes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtrados.length === 0 ? (
              <Card style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No hay reportes de tipo "{filtro}".
              </Card>
            ) : filtrados.map((r, i) => {
              const isNeg = r.tipo === 'Negativo';
              return (
                <Card key={i} style={{
                  padding: '1.25rem',
                  borderLeft: `4px solid ${isNeg ? '#ef4444' : '#22c55e'}`,
                  background: isNeg ? '#fef2f2' : '#f0fdf4',
                  borderRadius: '0 var(--radius-lg) var(--radius-lg) 0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      {/* Badges */}
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span style={{ background: isNeg ? '#fee2e2' : '#dcfce7', color: isNeg ? '#991b1b' : '#166534', fontSize: 13, fontWeight: 700, padding: '3px 12px', borderRadius: 20 }}>
                          {r.tipo}
                        </span>
                        <span style={{ background: '#f3f4f6', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, padding: '3px 12px', borderRadius: 20 }}>
                          {GRAVEDAD_LABEL[r.gravedad]}
                        </span>
                      </div>
                      {/* Fecha */}
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>📅</span> {r.fecha} - {r.hora}
                      </div>
                      {/* Descripción */}
                      <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 8 }}>{r.desc}</p>
                      {/* Autor */}
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        <strong>Generado por:</strong> {r.por}
                      </div>
                    </div>
                    {/* Cambio de puntos */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Puntos de conducta</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18, fontWeight: 700 }}>{r.ptsAntes}</span>
                        <span style={{ fontSize: 16, color: isNeg ? '#ef4444' : '#16a34a' }}>{isNeg ? '↘' : '↗'}</span>
                        <span style={{ fontSize: 18, fontWeight: 700, color: isNeg ? '#ef4444' : '#16a34a' }}>{r.ptsDespues}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
