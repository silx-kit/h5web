import React from 'react';
import shallow from 'zustand/shallow';
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
    showGrid,
    toggleGrid,
  ] = useHeatmapConfig(state => [
    state.hasLogScale,
    state.toggleLogScale,
    state.keepAspectRatio,
    state.toggleAspectRatio,
    state.showGrid,
    state.toggleGrid,
    shallow,
  ]);

  return (
    <>
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
      <Toggler label="Show grid" value={showGrid} onChange={toggleGrid} />
      <ScreenshotButton />
    </>
  );
}

export default HeatmapToolbar;
