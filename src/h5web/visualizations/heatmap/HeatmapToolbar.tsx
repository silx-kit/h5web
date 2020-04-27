import React from 'react';
import shallow from 'zustand/shallow';
import styles from './HeatmapToolbar.module.css';
import ColorMapSelector from './ColorMapSelector';
import Toggler from './Toggler';
import { useHeatmapStore } from './store';

function HeatmapToolbar(): JSX.Element {
  const [
    hasLogScale,
    toggleLogScale,
    keepAspectRatio,
    toggleAspectRatio,
  ] = useHeatmapStore(state => [
    state.hasLogScale,
    state.toggleLogScale,
    state.keepAspectRatio,
    state.toggleAspectRatio,
    shallow,
  ]);

  return (
    <div className={styles.toolbar}>
      <ColorMapSelector />
      <Toggler
        label="Log scale"
        value={hasLogScale}
        onChange={toggleLogScale}
      />
      <Toggler
        label="Keep ratio"
        value={keepAspectRatio}
        onChange={toggleAspectRatio}
      />
    </div>
  );
}

export default HeatmapToolbar;
