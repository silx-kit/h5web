import { ReactNode, useContext } from 'react';
import AxisSystemContext from '../shared/AxisSystemContext';

interface Props {
  children: ReactNode;
}

function Mesh(props: Props) {
  const { children } = props;

  const {
    abscissaConfig,
    ordinateConfig,
    abscissaScale,
    ordinateScale,
    visSize,
  } = useContext(AxisSystemContext);

  const [minAbscissa, maxAbscissa] = abscissaConfig.visDomain;
  const [minOrdinate, maxOrdinate] = ordinateConfig.visDomain;

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
