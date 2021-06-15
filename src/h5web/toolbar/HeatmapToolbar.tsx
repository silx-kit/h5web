import { MdAspectRatio } from 'react-icons/md';
import ToggleBtn from './controls/ToggleBtn';
import { useHeatmapConfig } from '../vis-packs/core/heatmap/config';
import DomainSlider from './controls/DomainSlider/DomainSlider';
import SnapshotButton from './controls/SnapshotButton';
import Separator from './Separator';
import Toolbar from './Toolbar';
import ColorMapSelector from './controls/ColorMapSelector/ColorMapSelector';
import ScaleSelector from './controls/ScaleSelector/ScaleSelector';
import shallow from 'zustand/shallow';
import GridToggler from './controls/GridToggler';

function HeatmapToolbar() {
  const {
    dataDomain,
    customDomain,
    setCustomDomain,
    colorMap,
    setColorMap,
    scaleType,
    setScaleType,
    layout,
    setLayout,
    showGrid,
    toggleGrid,
    invertColorMap,
    toggleColorMapInversion,
  } = useHeatmapConfig((state) => state, shallow);

  return (
    <Toolbar>
      {dataDomain ? (
        <DomainSlider
          dataDomain={dataDomain}
          customDomain={customDomain}
          scaleType={scaleType}
          onCustomDomainChange={setCustomDomain}
        />
      ) : (
        <div />
      )}

      {dataDomain ? <Separator /> : <div />}

      <ColorMapSelector
        value={colorMap}
        onValueChange={setColorMap}
        invert={invertColorMap}
        onInversionChange={toggleColorMapInversion}
      />

      <Separator />

      <ScaleSelector value={scaleType} onScaleChange={setScaleType} />

      <Separator />

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
