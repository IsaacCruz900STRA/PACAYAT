// src/pages/directivo/Estadisticas.jsx
import { BarChart2, TrendingDown, AlertTriangle, ClipboardList } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card       from '../../components/ui/Card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import { ALUMNOS_MOCK, REPORTES_MOCK } from './_mockData';

// ── Datos calculados ─────────────────────────────────────────
const promedioEscuela = (ALUMNOS_MOCK.reduce((s,a)=>s+a.puntos,0)/ALUMNOS_MOCK.length).toFixed(1)*1;

// Promedio por grupo
const GRUPOS_DATA = [
  { grupo:'1° A', promedio:8.2, alumnos:32 },
  { grupo:'1° B', promedio:7.4, alumnos:30 },
  { grupo:'1° C', promedio:7.8, alumnos:29 },
  { grupo:'2° A', promedio:8.1, alumnos:31 },
  { grupo:'2° B', promedio:7.7, alumnos:28 },
  { grupo:'2° C', promedio:7.9, alumnos:30 },
  { grupo:'3° A', promedio:8.3, alumnos:27 },
  { grupo:'3° B', promedio:7.8, alumnos:29 },
  { grupo:'3° C', promedio:7.5, alumnos:26 },
];

// Índice de reprobados por grupo (calificación < 6)
const REPROBADOS_DATA = [
  { grupo:'1° A', reprobados:3, total:32 },
  { grupo:'1° B', reprobados:6, total:30 },
  { grupo:'1° C', reprobados:4, total:29 },
  { grupo:'2° A', reprobados:2, total:31 },
  { grupo:'2° B', reprobados:8, total:28 },
  { grupo:'2° C', reprobados:3, total:30 },
  { grupo:'3° A', reprobados:1, total:27 },
  { grupo:'3° B', reprobados:5, total:29 },
  { grupo:'3° C', reprobados:7, total:26 },
].map(d => ({ ...d, porcentaje: ((d.reprobados/d.total)*100).toFixed(1)*1 }));

const totalReprobados = REPROBADOS_DATA.reduce((s,d)=>s+d.reprobados,0);
const totalAlumnos    = REPROBADOS_DATA.reduce((s,d)=>s+d.total,0);

// Distribución de conducta
const CONDUCTA_PIE = [
  { name:'Excelente (85-100)', value: ALUMNOS_MOCK.filter(a=>a.puntos>=85).length,         color:'#16a34a' },
  { name:'Bueno (70-84)',      value: ALUMNOS_MOCK.filter(a=>a.puntos>=70&&a.puntos<85).length, color:'#2563eb' },
  { name:'Regular (60-69)',    value: ALUMNOS_MOCK.filter(a=>a.puntos>=60&&a.puntos<70).length, color:'#d97706' },
  { name:'En riesgo (<60)',    value: ALUMNOS_MOCK.filter(a=>a.puntos<60).length,           color:'#dc2626' },
];

// Reportes por mes
const REPORTES_MES = [
  { mes:'Ene', negativos:8,  positivos:3 },
  { mes:'Feb', negativos:12, positivos:5 },
  { mes:'Mar', negativos:9,  positivos:7 },
  { mes:'Abr', negativos:15, positivos:4 },
  { mes:'May', negativos:6,  positivos:9 },
];

// Asistencia mensual %
const ASISTENCIA_DATA = [
  { mes:'Ene', porcentaje:94 },
  { mes:'Feb', porcentaje:91 },
  { mes:'Mar', porcentaje:96 },
  { mes:'Abr', porcentaje:89 },
  { mes:'May', porcentaje:93 },
];

const TOOLTIP_STYLE = { fontSize:13, borderRadius:8, border:'1px solid var(--border)' };

export default function DirectivoEstadisticas() {
  return (
    <div style={{ padding:'0 2rem 2rem' }}>
      <PageHeader title="Estadísticas" subtitle="Indicadores académicos y de conducta de la institución" />

      {/* KPIs rápidos */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
        {[
          { label:'Promedio General',    value:`${promedioEscuela}`,          color:'var(--green-700)', icon:<BarChart2 size={22} /> },
          { label:'Índice de Reprobados',value:`${((totalReprobados/totalAlumnos)*100).toFixed(1)}%`, color:'#dc2626', icon:<TrendingDown size={22} /> },
          { label:'Alumnos en Riesgo',   value:ALUMNOS_MOCK.filter(a=>a.puntos<60).length, color:'#ea580c', icon:<AlertTriangle size={22} /> },
          { label:'Total Reportes (Abr)',value:REPORTES_MOCK.length, color:'#2563eb', icon:<ClipboardList size={22} /> },
        ].map(k => (
          <Card key={k.label} style={{ padding:'1.25rem', textAlign:'center' }}>
            <div style={{ fontSize:22, marginBottom:6, display:'flex', justifyContent:'center' }}>{k.icon}</div>
            <div style={{ fontSize:26, fontWeight:700, color:k.color }}>{k.value}</div>
            <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:3 }}>{k.label}</div>
          </Card>
        ))}
      </div>

      {/* Promedio por grupo */}
      <Card style={{ padding:'1.25rem', marginBottom:'1.25rem' }}>
        <h3 style={{ fontSize:16, fontWeight:700, marginBottom:'1.25rem' }}>Promedio de Calificaciones por Grupo</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={GRUPOS_DATA} margin={{ top:5, right:10, left:-10, bottom:5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="grupo" tick={{ fontSize:12 }} />
            <YAxis domain={[5,10]} tick={{ fontSize:12 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v=>[v.toFixed(1),'Promedio']} />
            <Bar dataKey="promedio" fill="#15803d" radius={[4,4,0,0]}>
              {GRUPOS_DATA.map((d,i) => (
                <Cell key={i} fill={d.promedio>=8?'#15803d':d.promedio>=7?'#d97706':'#dc2626'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem', marginBottom:'1.25rem' }}>
        {/* Índice de reprobados */}
        <Card style={{ padding:'1.25rem' }}>
          <h3 style={{ fontSize:16, fontWeight:700, marginBottom:'1.25rem' }}>
            Índice de Reprobados por Grupo
            <span style={{ marginLeft:8, fontSize:13, fontWeight:400, color:'var(--text-secondary)' }}>
              Total: {totalReprobados}/{totalAlumnos} ({((totalReprobados/totalAlumnos)*100).toFixed(1)}%)
            </span>
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={REPROBADOS_DATA} margin={{ top:5, right:10, left:-10, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="grupo" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:11 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v,n)=>[`${v}%`,'% Reprobados']} />
              <Bar dataKey="porcentaje" fill="#ef4444" radius={[4,4,0,0]}>
                {REPROBADOS_DATA.map((d,i)=>(
                  <Cell key={i} fill={d.porcentaje>=20?'#dc2626':d.porcentaje>=10?'#f97316':'#fbbf24'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Distribución conducta */}
        <Card style={{ padding:'1.25rem' }}>
          <h3 style={{ fontSize:16, fontWeight:700, marginBottom:'1.25rem' }}>Distribución de Conducta</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={CONDUCTA_PIE} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {CONDUCTA_PIE.map((e,i)=><Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v,n)=>[`${v} alumnos`,n]} />
              <Legend iconType="circle" iconSize={10} formatter={(v)=><span style={{ fontSize:12 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>
        {/* Reportes por mes */}
        <Card style={{ padding:'1.25rem' }}>
          <h3 style={{ fontSize:16, fontWeight:700, marginBottom:'1.25rem' }}>Reportes de Conducta por Mes</h3>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={REPORTES_MES} margin={{ top:5, right:10, left:-10, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="mes" tick={{ fontSize:12 }} />
              <YAxis tick={{ fontSize:12 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="negativos" name="Negativos" fill="#ef4444" radius={[4,4,0,0]} />
              <Bar dataKey="positivos" name="Positivos" fill="#22c55e" radius={[4,4,0,0]} />
              <Legend iconType="circle" iconSize={10} formatter={v=><span style={{ fontSize:12 }}>{v}</span>} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Asistencia mensual */}
        <Card style={{ padding:'1.25rem' }}>
          <h3 style={{ fontSize:16, fontWeight:700, marginBottom:'1.25rem' }}>Porcentaje de Asistencia Mensual</h3>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={ASISTENCIA_DATA} margin={{ top:5, right:10, left:-10, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" tick={{ fontSize:12 }} />
              <YAxis domain={[80,100]} tick={{ fontSize:12 }} tickFormatter={v=>`${v}%`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v=>[`${v}%`,'Asistencia']} />
              <Line type="monotone" dataKey="porcentaje" stroke="#15803d" strokeWidth={2.5} dot={{ r:4, fill:'#15803d' }} activeDot={{ r:6 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
