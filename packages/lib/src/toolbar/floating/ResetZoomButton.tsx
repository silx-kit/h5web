import { useFrame, useThree } from '@react-three/fiber';
import { useState } from 'react';

import FloatingControl from './FloatingControl';
import styles from './ResetZoomButton.module.css';

function ResetZoomButton() {
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);

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
        hidden={!isVisible}
        onClick={() => resetZoom()}
      >
        <span className={styles.btnLike}>Reset zoom</span>
      </button>
    </FloatingControl>
  );
}

export default ResetZoomButton;
