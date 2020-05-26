import React from 'react';
import shallow from 'zustand/shallow';
import { MdAspectRatio, MdGridOn, MdLinearScale } from 'react-icons/md';
import ColorMapSelector from './ColorMapSelector';
import Toggler from '../shared/Toggler';
import { useHeatmapConfig } from './config';
import DomainSlider from './DomainSlider';
import ScreenshotButton from '../shared/ScreenshotButton';
import Separator from '../shared/Separator';

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
      <Separator />
      <ColorMapSelector />
      <Separator />
      <Toggler
        label="Symlog"
        icon={MdLinearScale}
        value={hasLogScale}
        onChange={toggleLogScale}
      />
      <Toggler
        label="Keep ratio"
        icon={MdAspectRatio}
        value={keepAspectRatio}
        onChange={toggleAspectRatio}
      />
      <Toggler
        label="Grid"
        icon={MdGridOn}
        value={showGrid}
        onChange={toggleGrid}
      />
      <Separator />
      <ScreenshotButton />
    </>
  );
}

export default HeatmapToolbar;
