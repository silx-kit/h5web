import { type ThreeElements } from '@react-three/fiber';

import { type Size } from '../models';
import { useVisCanvasContext } from './VisCanvasProvider';

export type VisMeshProps = Props & ThreeElements['mesh'];

interface Props {
  size?: Size;
}

function VisMesh(props: VisMeshProps) {
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

export default VisMesh;
