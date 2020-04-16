import React from 'react';
import { FiEyeOff, FiEye } from 'react-icons/fi';
import styles from './HeatmapVis.module.css';
import { useHeatmapState, useHeatmapActions } from './store';

function LogScaleToggler(): JSX.Element {
  const { hasLogScale } = useHeatmapState();
  const { toggleLogScale } = useHeatmapActions();

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
