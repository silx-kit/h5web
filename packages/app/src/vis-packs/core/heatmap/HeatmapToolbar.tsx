import type { Domain } from '@h5web/lib';
import {
  ColorMapSelector,
  DomainSlider,
  FlipYAxisToggler,
  GridToggler,
  ScaleSelector,
  ScaleType,
  Separator,
  SnapshotButton,
  ToggleBtn,
  Toolbar,
} from '@h5web/lib';
import { useEffect } from 'react';
import { MdAspectRatio } from 'react-icons/md';
import shallow from 'zustand/shallow';

import { useHeatmapConfig } from './config';

interface Props {
  dataDomain: Domain;
  initialScaleType: ScaleType | undefined;
}

function HeatmapToolbar(props: Props) {
  const { dataDomain, initialScaleType } = props;

  const {
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
    flipYAxis,
    toggleYAxisFlip,
  } = useHeatmapConfig((state) => state, shallow);

  useEffect(() => {
    if (initialScaleType) {
      setScaleType(initialScaleType);
    }
  }, [initialScaleType, setScaleType]);

  return (
    <Toolbar>
      <DomainSlider
        dataDomain={dataDomain}
        customDomain={customDomain}
        scaleType={scaleType}
        onCustomDomainChange={setCustomDomain}
      />
      <Separator />

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
