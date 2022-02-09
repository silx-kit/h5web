import type { MeshProps } from '@react-three/fiber';

import { useAxisSystemContext } from './AxisSystemContext';

function VisMesh(props: MeshProps) {
  const { children, ...meshProps } = props;

  const { visSize } = useAxisSystemContext();

  return (
    <mesh {...meshProps}>
      <planeGeometry args={[visSize.width, visSize.height]} />
      {children}
    </mesh>
  );
}

export default VisMesh;
