import type { Color } from '@react-three/fiber';
import { useMemo } from 'react';
import type { Vector2 } from 'three';
import { PlaneGeometry } from 'three';

import { useAxisSystemContext } from './AxisSystemContext';

interface Props {
  startPoint: Vector2;
  endPoint: Vector2;
  color?: Color;
  opacity?: number;
  borderColor?: Color;
}

function SelectionRect(props: Props) {
  const {
    startPoint: dataStartPoint,
    endPoint: dataEndPoint,
    color = 'red',
    opacity = 0.5,
    borderColor,
  } = props;

  const { dataToWorld } = useAxisSystemContext();
  const startPoint = dataToWorld(dataStartPoint);
  const endPoint = dataToWorld(dataEndPoint);

  const width = endPoint.x - startPoint.x;
  const height = endPoint.y - startPoint.y;

  const rectGeometry = useMemo(
    () => new PlaneGeometry(Math.abs(width), Math.abs(height)),
    [height, width]
  );

  return (
    <group position={[startPoint.x + width / 2, startPoint.y + height / 2, 0]}>
      <mesh geometry={rectGeometry}>
        <meshBasicMaterial opacity={opacity} transparent color={color} />
      </mesh>
      {borderColor && (
        <lineSegments>
          <lineBasicMaterial color={borderColor} />
          <edgesGeometry args={[rectGeometry]} />
        </lineSegments>
      )}
    </group>
  );
}

export default SelectionRect;
