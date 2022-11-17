import type { MeshProps } from '@react-three/fiber';

import type { Size } from '../models';
import { useVisCanvasContext } from './VisCanvasProvider';

interface Props extends MeshProps {
  size?: Size;
}

function VisMesh(props: Props) {
  const { children, size, ...meshProps } = props;

  const { visSize } = useVisCanvasContext();
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
