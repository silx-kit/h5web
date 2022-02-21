import type { Color } from '@react-three/fiber';
import type { Vector2 } from 'three';

interface Props {
  startPoint: Vector2;
  endPoint: Vector2;
  color?: Color;
  opacity?: number;
}

function SelectionRect(props: Props) {
  const { startPoint, endPoint, color = 'red', opacity = 0.5 } = props;
  const width = endPoint.x - startPoint.x;
  const height = endPoint.y - startPoint.y;

  return (
    <mesh position={[startPoint.x + width / 2, startPoint.y + height / 2, 0]}>
      <meshBasicMaterial opacity={opacity} transparent color={color} />
      <planeGeometry args={[Math.abs(width), Math.abs(height)]} />
    </mesh>
  );
}

export default SelectionRect;
