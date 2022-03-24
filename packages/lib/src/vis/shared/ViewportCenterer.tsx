import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type { Vector2 } from 'three';

import { useMoveCameraTo } from '../../interactions/hooks';
import { useAxisSystemContext } from './AxisSystemContext';

function ViewportCenterer() {
  const { dataToWorld, worldToData } = useAxisSystemContext();
  const viewportCenter = useRef<Vector2>();
  const { position } = useThree((state) => state.camera);

  const moveCameraTo = useMoveCameraTo();

  useFrame(() => {
    viewportCenter.current = worldToData(position);
  });

  useEffect(() => {
    if (viewportCenter.current) {
      // On resize, move camera to the latest saved viewport center coordinates
      const { x, y } = dataToWorld(viewportCenter.current);
      moveCameraTo(x, y);
    }
  }, [viewportCenter, moveCameraTo, dataToWorld, position.x, position.y]);

  return null;
}

export default ViewportCenterer;
