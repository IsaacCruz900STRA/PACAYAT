// src/pages/tutor/Horario.jsx
import { useState, useEffect } from 'react';
import { useTutor }    from '../../context/TutorContext';
import Card            from '../../components/ui/Card';
import SelectorHijo    from '../../components/tutor/SelectorHijo';
import HorarioGrid, { BLOQUES_9, RECESO_9, DIAS_DEFAULT } from '../../components/horarios/HorarioGrid';
import { getHorarioAlumnoGrid } from '../../api/horarios';

export default function TutorHorario() {
  const { hijoActual, loading: loadingTutor, hijos } = useTutor();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!hijoActual?.id) { setData(null); return; }
    setLoading(true);
    setError('');
    getHorarioAlumnoGrid(hijoActual.id)
      .then(({ data }) => setData(data))
      .catch(() => setError('No se pudo cargar el horario.'))
      .finally(() => setLoading(false));
  }, [hijoActual?.id]);

  return (
    <div style={{ padding:'0 2rem 2rem' }}>
      <div style={{ padding:'1.5rem 0 1rem' }}>
        <h1 style={{ fontSize:22, fontWeight:700 }}>Horario Escolar</h1>
        {data?.cicloEscolar && <p style={{ fontSize:13, color:'var(--text-secondary)', marginTop:2 }}>Ciclo: {data.cicloEscolar.nombre}</p>}
      </div>

      <SelectorHijo />

      {!loadingTutor && hijos.length === 0 && (
        <Card style={{ padding:'3rem', textAlign:'center', color:'var(--text-secondary)' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📅</div>
          <p style={{ fontWeight:600 }}>Sin alumnos registrados</p>
          <p style={{ fontSize:14, marginTop:6 }}>Contacta a la secretaría para vincular a tus hijos.</p>
        </Card>
      )}

      {!loadingTutor && hijoActual && (
        <>
          <div style={{
            background:'linear-gradient(135deg, #1B5E30 0%, #2E7D32 100%)',
            borderRadius:'var(--radius-lg)', padding:'1rem 1.5rem', color:'#fff',
            marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:12,
          }}>
            <span style={{ fontSize:22 }}>👤</span>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:16 }}>{hijoActual.nombre}</div>
              <div style={{ fontSize:13, opacity:.85 }}>
                {data?.alumno?.grupo || `Grupo ${hijoActual.idGrupo||'—'}`}
                {data?.alumno?.matricula && ` · Matrícula ${data.alumno.matricula}`}
              </div>
            </div>
            {data?.totalClases !== undefined && (
              <div style={{ textAlign:'center', flexShrink:0 }}>
                <div style={{ fontSize:22, fontWeight:800 }}>{data.totalClases}</div>
                <div style={{ fontSize:10, opacity:.8 }}>clases/semana</div>
              </div>
            )}
          </div>

          {loading ? (
            <Card style={{ padding:'2rem', textAlign:'center', color:'var(--text-secondary)' }}>Cargando horario…</Card>
          ) : error ? (
            <Card style={{ padding:'2rem', textAlign:'center' }}>
              <div style={{ fontSize:36, marginBottom:10 }}>📋</div>
              <div style={{ fontWeight:600 }}>Sin horario disponible</div>
              <div style={{ fontSize:13, color:'var(--text-secondary)', marginTop:6 }}>{error}</div>
            </Card>
          ) : !data || !data.totalClases ? (
            <Card style={{ padding:'2rem', textAlign:'center', color:'var(--text-secondary)' }}>
              <div style={{ fontSize:36, marginBottom:10 }}>📅</div>
              <div style={{ fontWeight:600 }}>Horario no generado aún</div>
              <div style={{ fontSize:13, marginTop:6 }}>El administrador generará el horario próximamente.</div>
            </Card>
          ) : (
            <Card style={{ padding:0, overflow:'hidden' }}>
              <HorarioGrid
                grid={data.grid}
                bloques={data.bloques || BLOQUES_9}
                receso={data.receso  || RECESO_9}
                dias={data.dias     || DIAS_DEFAULT}
                modo="grupo"
                titulo={data.alumno?.nombreCompleto}
                subtitulo={data.alumno?.grupo}
              />
            </Card>
          )}
        </>
      )}
    </div>
  );
}
