import type { MeshProps } from '@react-three/fiber';

import type { Size } from '../models';
import { useAxisSystemContext } from './AxisSystemContext';

interface Props extends MeshProps {
  size?: Size;
}

function VisMesh(props: Props) {
  const { children, size, ...meshProps } = props;

  const { visSize } = useAxisSystemContext();
  const { width, height } = size ?? visSize;

  return (
    <mesh {...meshProps}>
      <planeGeometry args={[width, height]} />
      {children}
    </mesh>
  );
}

export type { Props as VisMeshProps };
export default VisMesh;
