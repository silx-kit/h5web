import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type { Vector2 } from 'three';

import { useMoveCameraTo } from '../../interactions/hooks';
import { useAxisSystemContext } from './AxisSystemProvider';

function ViewportCenterer() {
  const { dataToWorld, worldToData } = useAxisSystemContext();
  const viewportCenter = useRef<Vector2>();
  const camera = useThree((state) => state.camera);

  const moveCameraTo = useMoveCameraTo();

  useFrame(() => {
    viewportCenter.current = worldToData(camera.position);
  });

  useEffect(() => {
    if (viewportCenter.current) {
      // On resize, move camera to the latest saved viewport center coordinates
      const { x, y } = dataToWorld(viewportCenter.current);
      moveCameraTo(x, y);
    }
  }, [viewportCenter, moveCameraTo, dataToWorld, camera]);

  return null;
}

export default ViewportCenterer;
