import React, { ReactElement } from 'react';
import { MdAspectRatio, MdDomain, MdGridOn } from 'react-icons/md';
import ToggleBtn from '../shared/ToggleBtn';
import { useHeatmapConfig } from './config';
import DomainSlider from './DomainSlider';
import SnapshotButton from './SnapshotButton';
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
      {dataDomain && (
        <DomainSlider
          dataDomain={dataDomain}
          value={customDomain}
          onChange={setCustomDomain}
        />
      )}

      {dataDomain && <Separator />}

      <ColorMapSelector value={colorMap} onChange={setColorMap} />

      <Separator />

      <ScaleSelector value={scaleType} onScaleChange={setScaleType} />

      <Separator />

      <ToggleBtn
        label="Auto-scale"
        icon={MdDomain}
        value={autoScale}
        onChange={toggleAutoScale}
        disabled={isAutoScaleDisabled}
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

      <SnapshotButton />
    </Toolbar>
  );
}

export default HeatmapToolbar;
