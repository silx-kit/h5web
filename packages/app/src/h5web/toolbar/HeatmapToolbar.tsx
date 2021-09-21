import { MdAspectRatio } from 'react-icons/md';
import shallow from 'zustand/shallow';
import {
  ColorMapSelector,
  DomainSlider,
  FlipYAxisToggler,
  GridToggler,
  ScaleSelector,
  ScaleType,
  Separator,
  ToggleBtn,
  Toolbar,
} from '@h5web/lib';
import { useHeatmapConfig } from '../vis-packs/core/heatmap/config';
import SnapshotButton from './controls/SnapshotButton';

function HeatmapToolbar() {
  const {
    dataDomain,
    customDomain,
    setCustomDomain,
    colorMap,
    setColorMap,
    scaleType,
    staleDomainScaleType,
    setScaleType,
    layout,
    setLayout,
    showGrid,
    toggleGrid,
    invertColorMap,
    toggleColorMapInversion,
    flipYAxis,
    toggleYAxisFlip,
  } = useHeatmapConfig((state) => state, shallow);

  return (
    <Toolbar>
      {dataDomain && (
        <>
          <DomainSlider
            dataDomain={dataDomain}
            customDomain={customDomain}
            scaleType={staleDomainScaleType || scaleType}
            onCustomDomainChange={setCustomDomain}
          />
          <Separator />
        </>
      )}

      <ColorMapSelector
        value={colorMap}
        onValueChange={setColorMap}
        invert={invertColorMap}
        onInversionChange={toggleColorMapInversion}
      />

      <Separator />

      <ScaleSelector
        value={scaleType}
        onScaleChange={setScaleType}
        options={[
          ScaleType.Linear,
          ScaleType.Log,
          ScaleType.SymLog,
          ScaleType.Sqrt,
        ]}
      />

      <Separator />

      <FlipYAxisToggler value={flipYAxis} onToggle={toggleYAxisFlip} />

      <ToggleBtn
        label="Keep ratio"
        icon={MdAspectRatio}
        value={layout === 'cover'}
        onToggle={() => setLayout(layout === 'cover' ? 'fill' : 'cover')}
      />

      <GridToggler value={showGrid} onToggle={toggleGrid} />

      <Separator />

      <SnapshotButton />
    </Toolbar>
  );
}

export default HeatmapToolbar;
