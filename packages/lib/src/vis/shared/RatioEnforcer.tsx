import { useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';

import { useMoveCameraTo } from '../../interactions/hooks';
import { useVisCanvasContext } from './VisCanvasProvider';

function RatioEnforcer() {
  const { visRatio } = useVisCanvasContext();
  const camera = useThree((state) => state.camera);
  const moveCameraTo = useMoveCameraTo();

  useLayoutEffect(() => {
    if (visRatio === undefined || camera.scale.x === camera.scale.y) {
      return;
    }

    const targetScale = Math.max(camera.scale.x, camera.scale.y);
    camera.scale.x = targetScale;
    camera.scale.y = targetScale;

    moveCameraTo(camera.position);
  }, [camera, moveCameraTo, visRatio]);

  return null;
}

export default RatioEnforcer;
