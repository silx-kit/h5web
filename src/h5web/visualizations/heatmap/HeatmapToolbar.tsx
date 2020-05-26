import React, { ReactElement } from 'react';
import { MdAspectRatio, MdGridOn, MdLinearScale } from 'react-icons/md';
import ColorMapSelector from './ColorMapSelector';
import Toggler from '../shared/Toggler';
import { useHeatmapConfig } from './config';
import DomainSlider from './DomainSlider';
import ScreenshotButton from '../shared/ScreenshotButton';
import Separator from '../shared/Separator';
import Toolbar from '../shared/Toolbar';

function HeatmapToolbar(): ReactElement {
  const {
    hasLogScale,
    toggleLogScale,
    keepAspectRatio,
    toggleAspectRatio,
    showGrid,
    toggleGrid,
  } = useHeatmapConfig();

  return (
    <Toolbar>
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
    </Toolbar>
  );
}

export default HeatmapToolbar;
