import type { ReactElement } from 'react';
import { MdAspectRatio, MdDomain, MdGridOn } from 'react-icons/md';
import ToggleBtn from './controls/ToggleBtn';
import { useHeatmapConfig } from '../visualizations/heatmap/config';
import DomainSlider from './controls/DomainSlider';
import SnapshotButton from './controls/SnapshotButton';
import Separator from './Separator';
import Toolbar from './Toolbar';
import ColorMapSelector from './controls/ColorMapSelector';
import ScaleSelector from './controls/ScaleSelector';

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
