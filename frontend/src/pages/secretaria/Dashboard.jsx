// src/pages/secretaria/Dashboard.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth }     from '../../context/AuthContext';
import Card            from '../../components/ui/Card';
import Button          from '../../components/ui/Button';
import PageHeader      from '../../components/layout/PageHeader';
import { ALUMNOS_MOCK, TUTORES_MOCK } from './_mockData';

const ACTIVIDADES = [
  { desc:'Nuevo alumno inscrito: Elena Torres Vargas', tag:'inscripcion', tagColor:'#dcfce7', tagText:'#14532d', grupo:'1° A',  hora:'Hoy, 11:30 AM'  },
  { desc:'Constancia de estudios generada para Juan Pérez', tag:'documento', tagColor:'#ede9fe', tagText:'#6b21a8', grupo:'1° A', hora:'Hoy, 10:15 AM' },
  { desc:'Nuevo tutor registrado: Rosa María Torres', tag:'tutor', tagColor:'#dbeafe', tagText:'#1e40af', grupo:'—', hora:'Ayer, 3:45 PM'    },
  { desc:'Acta de nacimiento subida para María López', tag:'archivo', tagColor:'#ffedd5', tagText:'#c2410c', grupo:'2° B', hora:'Ayer, 2:20 PM' },
  { desc:'Alumno actualizado: Carlos Martínez Díaz', tag:'inscripcion', tagColor:'#dcfce7', tagText:'#14532d', grupo:'3° A',  hora:'Ayer, 11:00 AM' },
];

const DOCS_PENDIENTES = [
  { nombre:'Juan Pérez García',      grupo:'1° A', doc:'CURP',                vence:'Vence en 3 días',  urgente:true  },
  { nombre:'María López Ruiz',       grupo:'2° B', doc:'Acta de nacimiento',  vence:'Vence en 5 días',  urgente:true  },
  { nombre:'Carlos Martínez',        grupo:'1° A', doc:'Comprobante domicilio',vence:'Vence en 7 días',  urgente:false },
  { nombre:'Ana Hernández',          grupo:'3° A', doc:'Certificado médico',   vence:'Vence en 10 días', urgente:false },
  { nombre:'Roberto Sánchez',        grupo:'2° A', doc:'Fotografías',          vence:'Vence en 12 días', urgente:false },
  { nombre:'Laura Ramírez',          grupo:'3° B', doc:'Boleta anterior',      vence:'Vence en 15 días', urgente:false },
  { nombre:'Jorge Flores',           grupo:'1° C', doc:'CURP',                 vence:'Vence en 18 días', urgente:false },
];

const ACCESOS = [
  { icon:'👤', iconBg:'#dcfce7', label:'Nuevo Alumno',      desc:'Registrar un nuevo alumno',   action:'/secretaria/alumnos'  },
  { icon:'👨‍👩‍👧', iconBg:'#dbeafe', label:'Nuevo Tutor',       desc:'Agregar tutor al sistema',    action:'/secretaria/tutores'  },
  { icon:'📄', iconBg:'#ede9fe', label:'Generar Constancia', desc:'Crear constancia de estudios', action:'/secretaria/documentos'},
  { icon:'⬆',  iconBg:'#fef3c7', label:'Subir Archivos',    desc:'Cargar documentos de alumnos', action:'/secretaria/documentos'},
];

export default function SecretariaDashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  return (
    <div style={{ padding:'0 2rem 2rem' }}>
      <PageHeader title="Panel de Secretaría" subtitle={user?.nombre} />

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
        {[
          { label:'Alumnos Inscritos',    value:ALUMNOS_MOCK.length, icon:'👥', iconBg:'#dcfce7' },
          { label:'Tutores Registrados',  value:TUTORES_MOCK.length, icon:'👨‍👩‍👧', iconBg:'#dbeafe' },
          { label:'Documentos Pendientes',value:DOCS_PENDIENTES.length, icon:'📄', iconBg:'#fef3c7' },
        ].map(s => (
          <Card key={s.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.25rem' }}>
            <div>
              <div style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:32, fontWeight:700 }}>{s.value}</div>
            </div>
            <div style={{ width:48, height:48, borderRadius:'50%', background:s.iconBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
              {s.icon}
            </div>
          </Card>
        ))}
      </div>

      {/* Accesos rápidos */}
      <h2 style={{ fontSize:16, fontWeight:700, marginBottom:'1rem' }}>Accesos Rápidos</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
        {ACCESOS.map(a => (
          <Card key={a.label} style={{ padding:'1.25rem', cursor:'pointer', transition:'box-shadow var(--transition)' }}
            onClick={() => navigate(a.action)}
            onMouseEnter={e=>e.currentTarget.style.boxShadow='var(--shadow-md)'}
            onMouseLeave={e=>e.currentTarget.style.boxShadow='var(--shadow)'}>
            <div style={{ width:44, height:44, borderRadius:'var(--radius)', background:a.iconBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, marginBottom:'0.75rem' }}>
              {a.icon}
            </div>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{a.label}</div>
            <div style={{ fontSize:13, color:'var(--text-secondary)' }}>{a.desc}</div>
          </Card>
        ))}
      </div>

      {/* Dos columnas */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>
        {/* Actividades */}
        <Card style={{ padding:0 }}>
          <div style={{ padding:'1rem 1.25rem', background:'#eff6ff', borderRadius:'var(--radius-lg) var(--radius-lg) 0 0' }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:'#1e40af' }}>Últimas Actividades</h3>
          </div>
          {ACTIVIDADES.map((a,i) => (
            <div key={i} style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:500, marginBottom:6, lineHeight:1.4 }}>{a.desc}</div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ background:a.tagColor, color:a.tagText, fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20 }}>{a.tag}</span>
                  {a.grupo !== '—' && <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{a.grupo}</span>}
                </div>
              </div>
              <div style={{ fontSize:12, color:'var(--text-muted)', whiteSpace:'nowrap', flexShrink:0 }}>{a.hora}</div>
            </div>
          ))}
        </Card>

        {/* Documentos pendientes */}
        <Card style={{ padding:0 }}>
          <div style={{ padding:'1rem 1.25rem', background:'#fff7ed', borderRadius:'var(--radius-lg) var(--radius-lg) 0 0' }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:'#92400e' }}>Documentos Pendientes</h3>
          </div>
          {DOCS_PENDIENTES.map((d,i) => (
            <div key={i} style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)' }}>
              <div style={{ fontWeight:600, fontSize:14 }}>{d.nombre}</div>
              <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:2 }}>{d.grupo} • {d.doc}</div>
              <div style={{ fontSize:12, color: d.urgente ? '#dc2626' : '#d97706', fontWeight:500, marginTop:2 }}>{d.vence}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
