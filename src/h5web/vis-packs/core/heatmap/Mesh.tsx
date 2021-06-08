import type { ReactNode } from 'react';
import { useCanvasScales } from '../hooks';
import type { Domain } from '../models';

interface Props {
  abscissaDomain: Domain;
  ordinateDomain: Domain;
  children: ReactNode;
}

function Mesh(props: Props) {
  const { abscissaDomain, ordinateDomain, children } = props;
  const [minAbscissa, maxAbscissa] = abscissaDomain;
  const [minOrdinate, maxOrdinate] = ordinateDomain;

  const { abscissaScale, ordinateScale } = useCanvasScales();

  const width = abscissaScale(maxAbscissa) - abscissaScale(minAbscissa);
  const height = ordinateScale(maxOrdinate) - ordinateScale(minOrdinate);

  const x = abscissaScale(minAbscissa + (maxAbscissa - minAbscissa) / 2);
  const y = ordinateScale(minOrdinate + (maxOrdinate - minOrdinate) / 2);

  return (
    <mesh position={[x, y, 0]}>
      <planeGeometry args={[width, height]} />
      {children}
    </mesh>
  );
}

export default Mesh;
