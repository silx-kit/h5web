import { useFrame, useThree } from '@react-three/fiber';
import { useState } from 'react';

import { useMoveCameraTo } from '../../interactions/hooks';
import FloatingControl from './FloatingControl';
import styles from './ResetZoomButton.module.css';

function ResetZoomButton() {
  const camera = useThree((state) => state.camera);
  const moveCameraTo = useMoveCameraTo();

  const [isVisible, setVisible] = useState(false);

  useFrame(() => {
    const isZoomedIn = camera.scale.x < 1 || camera.scale.y < 1;
    if (isVisible !== isZoomedIn) {
      setVisible(isZoomedIn);
    }
  });

  function resetZoom() {
    camera.scale.x = 1;
    camera.scale.y = 1;
    camera.updateMatrixWorld();

    moveCameraTo(0, 0);
  }

  return (
    <FloatingControl>
      <button
        className={styles.btn}
        type="button"
        hidden={!isVisible}
        onClick={() => resetZoom()}
      >
        <span className={styles.btnLike}>Reset zoom</span>
      </button>
    </FloatingControl>
  );
}

export default ResetZoomButton;
