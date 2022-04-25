import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

import { useMoveCameraTo } from '../../interactions/hooks';

interface Props {
  visRatio: number | undefined;
}

function RatioEnforcer(props: Props) {
  const { visRatio } = props;

  const camera = useThree((state) => state.camera);
  const moveCameraTo = useMoveCameraTo();

  useEffect(() => {
    if (!visRatio || camera.scale.x === camera.scale.y) {
      return;
    }

    const targetScale = Math.max(camera.scale.x, camera.scale.y);
    camera.scale.x = targetScale;
    camera.scale.y = targetScale;
    camera.updateMatrixWorld();
    moveCameraTo(camera.position.x, camera.position.y);
  }, [camera, moveCameraTo, visRatio]);

  return null;
}

export default RatioEnforcer;
