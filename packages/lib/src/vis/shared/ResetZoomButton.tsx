import { useThree } from '@react-three/fiber';

import { useFrameRendering } from '../hooks';
import Html from './Html';
import styles from './ResetZoomButton.module.css';
import { useMoveCameraTo } from './hooks';

function ResetZoomButton() {
  const camera = useThree((state) => state.camera);
  const moveCameraTo = useMoveCameraTo();

  useFrameRendering();

  const isZoomedIn = camera.scale.x < 1 || camera.scale.y < 1;

  function resetZoom() {
    camera.scale.x = 1;
    camera.scale.y = 1;

    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    moveCameraTo(0, 0);
  }

  return isZoomedIn ? (
    <Html className={styles.container}>
      <button className={styles.btn} type="button" onClick={() => resetZoom()}>
        Reset zoom
      </button>
    </Html>
  ) : null;
}

export default ResetZoomButton;
