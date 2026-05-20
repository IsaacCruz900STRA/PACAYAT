// src/pages/control-escolar/Dashboard.jsx
import { useNavigate } from 'react-router-dom';
import { Calendar, BookOpen, BarChart2 } from 'lucide-react';
import { useAuth }     from '../../context/AuthContext';
import Card            from '../../components/ui/Card';
import Button          from '../../components/ui/Button';
import PageHeader      from '../../components/layout/PageHeader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GRUPOS_MOCK, ASIGNACIONES_MOCK } from './_mockData';

const CHART_DATA = GRUPOS_MOCK.map(g => ({ grupo: g.nombre, promedio: g.promedio }));
const SIN_CAPTURA = ASIGNACIONES_MOCK.filter(a => !a.periodoActivo);
const ULTIMAS_ASIG = [...ASIGNACIONES_MOCK].reverse().slice(0, 5);

function StatCard({ label, value, icon, iconBg, sub }) {
  return (
    <Card style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.25rem' }}>
      <div>
        <div style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:4 }}>{label}</div>
        <div style={{ fontSize: sub ? 28 : 32, fontWeight:700, lineHeight:1.2, whiteSpace:'pre-line' }}>{value}</div>
      </div>
      <div style={{ width:48, height:48, borderRadius:'50%', background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        {icon}
      </div>
    </Card>
  );
}

export default function ControlEscolarDashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const totalAlumnos = GRUPOS_MOCK.reduce((s,g) => s+g.alumnos, 0);
  const promedioGral = (GRUPOS_MOCK.reduce((s,g) => s+g.promedio,0)/GRUPOS_MOCK.length).toFixed(1);

  const thS = { textAlign:'left', padding:'10px 16px', fontSize:13, fontWeight:600, color:'var(--green-800)', background:'var(--green-50)', borderBottom:'1px solid var(--border)' };

  return (
    <div style={{ padding:'0 2rem 2rem' }}>
      <PageHeader title="Panel de Control Escolar" subtitle={user?.nombre} />

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
        <StatCard label="Periodo Actual" value={'Marzo-\nAbril'} icon={<Calendar size={22} />} iconBg="#dbeafe" sub />
        <StatCard label="Materias Sin Captura" value={SIN_CAPTURA.length} icon={<BookOpen size={22} />} iconBg="#fee2e2" />
        <StatCard label="Promedio General" value={promedioGral} icon={<BarChart2 size={22} />} iconBg="#dbeafe" />
      </div>

      {/* Promedio por grado */}
      <Card style={{ padding:'1.25rem', marginBottom:'1.5rem' }}>
        <div style={{ display:'flex', gap:'1rem', marginBottom:'1.25rem' }}>
          {[
            { label:'1° Grado', val: (GRUPOS_MOCK.filter(g=>g.grado===1).reduce((s,g)=>s+g.promedio,0)/3).toFixed(1), alumnos: GRUPOS_MOCK.filter(g=>g.grado===1).reduce((s,g)=>s+g.alumnos,0) },
            { label:'2° Grado', val: (GRUPOS_MOCK.filter(g=>g.grado===2).reduce((s,g)=>s+g.promedio,0)/3).toFixed(1), alumnos: GRUPOS_MOCK.filter(g=>g.grado===2).reduce((s,g)=>s+g.alumnos,0) },
            { label:'3° Grado', val: (GRUPOS_MOCK.filter(g=>g.grado===3).reduce((s,g)=>s+g.promedio,0)/3).toFixed(1), alumnos: GRUPOS_MOCK.filter(g=>g.grado===3).reduce((s,g)=>s+g.alumnos,0) },
          ].map(g => (
            <Card key={g.label} style={{ flex:1, border:'1px solid var(--blue-100)', background:'var(--blue-50)', padding:'1rem' }}>
              <div style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:6 }}>{g.label}</div>
              <div style={{ fontSize:28, fontWeight:700, color: g.val>=8?'var(--green-700)':g.val>=7?'#d97706':'#dc2626' }}>{g.val}</div>
              <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:4 }}>{g.alumnos} alumnos</div>
            </Card>
          ))}
        </div>

        <h3 style={{ fontSize:16, fontWeight:700, marginBottom:'1rem' }}>Promedio por Grupo</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={CHART_DATA} margin={{ top:5, right:10, left:-10, bottom:5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="grupo" tick={{ fontSize:12 }} />
            <YAxis domain={[0,10]} tick={{ fontSize:12 }} />
            <Tooltip formatter={(v) => [v.toFixed(1),'Promedio']} />
            <Bar dataKey="promedio" fill="#15803d" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Dos columnas */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>
        {/* Sin captura */}
        <Card style={{ padding:0 }}>
          <div style={{ padding:'1rem 1.25rem', background:'#fef2f2', borderRadius:'var(--radius-lg) var(--radius-lg) 0 0' }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:'#991b1b' }}>Materias Sin Captura de Calificaciones</h3>
          </div>
          {SIN_CAPTURA.slice(0,5).map(a => (
            <div key={a.id} style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)' }}>
              <div style={{ fontWeight:600, fontSize:14 }}>{a.materia}</div>
              <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:2 }}>{a.grupo} • {a.docente}</div>
            </div>
          ))}
          <div style={{ padding:'10px 16px' }}>
            <Button variant="outline" fullWidth onClick={() => navigate('/control-escolar/calificaciones')}>
              Ver Todas las Materias
            </Button>
          </div>
        </Card>

        {/* Últimas asignaciones */}
        <Card style={{ padding:0 }}>
          <div style={{ padding:'1rem 1.25rem', background:'var(--green-50)', borderRadius:'var(--radius-lg) var(--radius-lg) 0 0' }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:'var(--green-800)' }}>Últimas Asignaciones</h3>
          </div>
          {ULTIMAS_ASIG.map((a,i) => (
            <div key={a.id} style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)' }}>
              <div style={{ fontWeight:600, fontSize:14 }}>{a.materia}</div>
              <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:2 }}>{a.grupo} • {a.docente}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{['Hoy','Ayer','Hace 2 días','Hace 3 días','Hace 4 días'][i]}</div>
            </div>
          ))}
          <div style={{ padding:'10px 16px' }}>
            <Button fullWidth onClick={() => navigate('/control-escolar/asignaciones')}>
              Nueva Asignación
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
