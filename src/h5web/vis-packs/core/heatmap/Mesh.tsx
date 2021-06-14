import { ReactNode, useContext } from 'react';
import { useCanvasScales } from '../hooks';
import AxisSystemContext from '../shared/AxisSystemContext';

interface Props {
  children: ReactNode;
}

function Mesh(props: Props) {
  const { children } = props;
  const { visSize, abscissaConfig, ordinateConfig } =
    useContext(AxisSystemContext);

  const [minAbscissa, maxAbscissa] = abscissaConfig.domain;
  const [minOrdinate, maxOrdinate] = ordinateConfig.domain;

  const { abscissaScale, ordinateScale } = useCanvasScales();
  const x = abscissaScale(minAbscissa + (maxAbscissa - minAbscissa) / 2);
  const y = ordinateScale(minOrdinate + (maxOrdinate - minOrdinate) / 2);

  return (
    <mesh position={[x, y, 0]}>
      <planeGeometry args={[visSize.width, visSize.height]} />
      {children}
    </mesh>
  );
}

export default Mesh;
