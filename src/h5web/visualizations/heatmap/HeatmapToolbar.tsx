import React, { ReactElement } from 'react';
import { MdAspectRatio, MdGridOn, MdLinearScale } from 'react-icons/md';
import ToggleBtn from '../shared/ToggleBtn';
import { useHeatmapConfig } from './config';
import DomainSlider from './DomainSlider';
import ScreenshotButton from '../shared/ScreenshotButton';
import Separator from '../shared/Separator';
import Toolbar from '../shared/Toolbar';
import ColorMapSelector from './ColorMapSelector';

function HeatmapToolbar(): ReactElement {
  const {
    colorMap,
    setColorMap,
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

      <ColorMapSelector value={colorMap} onChange={setColorMap} />
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
