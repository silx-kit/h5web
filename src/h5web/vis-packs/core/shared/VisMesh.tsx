import type { ReactNode } from 'react';
import type { MeshProps } from '@react-three/fiber';
import { useAxisSystemContext } from './AxisSystemContext';

interface Props extends MeshProps {
  children: ReactNode;
}

function VisMesh(props: Props) {
  const { children, ...meshProps } = props;

  const {
    abscissaConfig,
    ordinateConfig,
    abscissaScale,
    ordinateScale,
    visSize,
  } = useAxisSystemContext();

  const [minAbscissa, maxAbscissa] = abscissaConfig.visDomain;
  const [minOrdinate, maxOrdinate] = ordinateConfig.visDomain;

  const x = abscissaScale(minAbscissa + (maxAbscissa - minAbscissa) / 2);
  const y = ordinateScale(minOrdinate + (maxOrdinate - minOrdinate) / 2);

  return (
    <mesh position={[x, y, 0]} {...meshProps}>
      <planeGeometry args={[visSize.width, visSize.height]} />
      {children}
    </mesh>
  );
}

export default VisMesh;
