import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { type Vector3 } from 'three';

import { useMoveCameraTo } from '../../interactions/hooks';
import { useVisCanvasContext } from './VisCanvasProvider';

function ViewportCenterer() {
  const { dataToWorld, worldToData } = useVisCanvasContext();
  const viewportCenter = useRef<Vector3>();
  const camera = useThree((state) => state.camera);

  const moveCameraTo = useMoveCameraTo();

  useFrame(() => {
    viewportCenter.current = worldToData(camera.position);
  });

  useEffect(() => {
    // On resize, move camera to the latest saved viewport center coordinates
    if (viewportCenter.current) {
      const newPos = dataToWorld(viewportCenter.current);

      // Ignore previous center if no longer valid with current scale
      if (Number.isFinite(newPos.x) && Number.isFinite(newPos.y)) {
        moveCameraTo(newPos);
      }
    }
  }, [viewportCenter, moveCameraTo, dataToWorld, camera]);

  return null;
}

export default ViewportCenterer;
