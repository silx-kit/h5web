import { useThree } from '@react-three/fiber';

import { useCameraState } from '../../vis/hooks';
import FloatingControl from './FloatingControl';
import styles from './ResetZoomButton.module.css';

function ResetZoomButton() {
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);

  const isZoomedIn = useCameraState(({ scale }) => {
    return scale.x < 1 || scale.y < 1;
  }, []);

  function resetZoom() {
    camera.scale.x = 1;
    camera.scale.y = 1;
    camera.position.x = 0;
    camera.position.y = 0;
    camera.updateMatrixWorld();
    invalidate();
  }

  return (
    <FloatingControl>
      <button
        className={styles.btn}
        type="button"
        hidden={!isZoomedIn}
        onClick={() => resetZoom()}
      >
        <span className={styles.btnLike}>Reset zoom</span>
      </button>
    </FloatingControl>
  );
}

export default ResetZoomButton;
