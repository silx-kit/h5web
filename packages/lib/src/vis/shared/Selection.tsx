import type { Vector2 } from 'three';

interface Props {
  startPoint: Vector2;
  endPoint: Vector2;
  color?: string;
}

function Selection(props: Props) {
  const { startPoint, endPoint, color = '#ff0000' } = props;
  const width = endPoint.x - startPoint.x;
  const height = endPoint.y - startPoint.y;

  return (
    <mesh position={[startPoint.x + width / 2, startPoint.y + height / 2, 0]}>
      <meshBasicMaterial opacity={0.5} transparent color={color} />
      <planeGeometry args={[Math.abs(width), Math.abs(height)]} />
    </mesh>
  );
}

export default Selection;
