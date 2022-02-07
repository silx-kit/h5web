import type { MeshProps } from '@react-three/fiber';
import { useThree } from '@react-three/fiber';

function InteractionMesh(props: MeshProps) {
  const { width, height } = useThree((state) => state.size);

  return (
    <mesh {...props}>
      <meshBasicMaterial opacity={0} transparent />
      <planeGeometry args={[width, height]} />
    </mesh>
  );
}

export default InteractionMesh;
