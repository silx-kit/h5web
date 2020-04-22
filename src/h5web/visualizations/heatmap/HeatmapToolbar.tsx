import React from 'react';
import styles from './HeatmapToolbar.module.css';
import ColorMapSelector from './ColorMapSelector';
import LogScaleToggler from './LogScaleToggler';

function HeatmapToolbar(): JSX.Element {
  return (
    <div className={styles.toolbar}>
      <ColorMapSelector />
      <LogScaleToggler />
    </div>
  );
}

export default HeatmapToolbar;
