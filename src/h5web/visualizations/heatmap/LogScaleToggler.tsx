import React from 'react';
import { FiEyeOff, FiEye } from 'react-icons/fi';
import styles from './HeatmapToolbar.module.css';
import { useHeatmapStore } from './store';

function LogScaleToggler(): JSX.Element {
  const hasLogScale = useHeatmapStore(state => state.hasLogScale);
  const toggleLogScale = useHeatmapStore(state => state.toggleLogScale);

  return (
    <button
      className={styles.scaleTypeSelector}
      type="button"
      role="switch"
      aria-checked={hasLogScale}
      onClick={() => {
        toggleLogScale();
      }}
    >
      {hasLogScale ? <FiEye /> : <FiEyeOff />}
      SymLog scale
    </button>
  );
}

export default LogScaleToggler;
