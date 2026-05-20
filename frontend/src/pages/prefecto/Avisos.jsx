import AvisosViewer from '../../components/avisos/AvisosViewer';
const TIPOS = ['CONDUCTA', 'GENERAL'];
export default function PrefectoAvisos() {
  return <AvisosViewer tiposPermitidos={TIPOS} />;
}
