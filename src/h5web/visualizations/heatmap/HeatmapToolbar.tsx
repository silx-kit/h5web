import React from 'react';
import shallow from 'zustand/shallow';
import styles from './HeatmapToolbar.module.css';
import ColorMapSelector from './ColorMapSelector';
import Toggler from '../shared/Toggler';
import { useHeatmapConfig } from './config';
import DomainSlider from './DomainSlider';
import ScreenshotButton from '../shared/ScreenshotButton';

function HeatmapToolbar(): JSX.Element {
  const [
    hasLogScale,
    toggleLogScale,
    keepAspectRatio,
    toggleAspectRatio,
  ] = useHeatmapConfig(state => [
    state.hasLogScale,
    state.toggleLogScale,
    state.keepAspectRatio,
    state.toggleAspectRatio,
    shallow,
  ]);

  return (
    <div className={styles.toolbar}>
      <DomainSlider />
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
      <ScreenshotButton />
    </div>
  );
}

export default HeatmapToolbar;
