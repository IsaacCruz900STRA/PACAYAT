import AvisosViewer from '../../components/avisos/AvisosViewer';
const TIPOS = ['CONDUCTA', 'GENERAL', 'COLABORADORES'];
export default function PrefectoAvisos() {
  return <AvisosViewer tiposPermitidos={TIPOS} />;
}
