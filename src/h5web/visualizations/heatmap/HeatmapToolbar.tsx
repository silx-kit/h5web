import React, { ReactElement } from 'react';
import { MdAspectRatio, MdDomain, MdGridOn } from 'react-icons/md';
import ToggleBtn from '../shared/ToggleBtn';
import { useHeatmapConfig } from './config';
import DomainSlider from './DomainSlider';
import ScreenshotButton from './ScreenshotButton';
import Separator from '../shared/Separator';
import Toolbar from '../shared/Toolbar';
import ColorMapSelector from './ColorMapSelector';
import ScaleSelector from '../shared/ScaleSelector';

function HeatmapToolbar(): ReactElement {
  const {
    dataDomain,
    customDomain,
    setCustomDomain,
    colorMap,
    setColorMap,
    scaleType,
    setScaleType,
    keepAspectRatio,
    toggleAspectRatio,
    showGrid,
    toggleGrid,
    autoScale,
    toggleAutoScale,
    isAutoScaleDisabled,
  } = useHeatmapConfig();

  return (
    <Toolbar>
      <ToggleBtn
        label="Auto-scale"
        icon={MdDomain}
        value={autoScale}
        onChange={toggleAutoScale}
        disabled={isAutoScaleDisabled}
      />

      <Separator />

      {dataDomain && (
        <DomainSlider
          dataDomain={dataDomain}
          value={customDomain}
          onChange={setCustomDomain}
        />
      )}

      <Separator />

      <ColorMapSelector value={colorMap} onChange={setColorMap} />

      <Separator />

      <ScaleSelector value={scaleType} onScaleChange={setScaleType} />

      <Separator />

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
