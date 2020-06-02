import React, { ReactElement } from 'react';
import { MdAspectRatio, MdGridOn, MdLinearScale } from 'react-icons/md';
import ColorMapSelector from './ColorMapSelector';
import ToggleBtn from '../shared/ToggleBtn';
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

      <ToggleBtn
        label="Symlog"
        icon={MdLinearScale}
        value={hasLogScale}
        onChange={toggleLogScale}
      />
      <ToggleBtn
        label="Keep ratio"
        icon={MdAspectRatio}
        value={keepAspectRatio}
        onChange={toggleAspectRatio}
      />
      <ToggleBtn
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
