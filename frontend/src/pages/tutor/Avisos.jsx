import AvisosViewer from '../../components/avisos/AvisosViewer';
const TIPOS = ['CONDUCTA', 'REINSCRIPCION', 'GENERAL'];
export default function TutorAvisos() {
  return <AvisosViewer tiposPermitidos={TIPOS} />;
}
