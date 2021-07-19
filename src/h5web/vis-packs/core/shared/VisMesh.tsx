import type { ReactNode } from 'react';
import type { MeshProps } from '@react-three/fiber';
import { useAxisSystemContext } from './AxisSystemContext';

interface Props extends MeshProps {
  children: ReactNode;
}

function VisMesh(props: Props) {
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
