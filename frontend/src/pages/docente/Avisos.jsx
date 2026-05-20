import AvisosViewer from '../../components/avisos/AvisosViewer';
const TIPOS = ['PERIODO_EVALUACION', 'GENERAL', 'COLABORADORES'];
export default function DocenteAvisos() {
  return <AvisosViewer tiposPermitidos={TIPOS} />;
}
