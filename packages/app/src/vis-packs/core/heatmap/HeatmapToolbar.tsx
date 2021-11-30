import type { Domain } from '@h5web/lib';
import {
  DownloadBtn,
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
import type { ArrayShape, Dataset, NumericType } from '@h5web/shared';
import { useEffect, useContext } from 'react';
import { FiDownload } from 'react-icons/fi';
import { MdAspectRatio } from 'react-icons/md';
import shallow from 'zustand/shallow';

import { ProviderContext } from '../../../providers/context';
import { useHeatmapConfig } from './config';

interface Props {
  dataset: Dataset<ArrayShape, NumericType>;
  dataDomain: Domain;
  selection: string | undefined;
  initialScaleType: ScaleType | undefined;
}

function HeatmapToolbar(props: Props) {
  const { dataset, dataDomain, selection, initialScaleType } = props;

  const { getTiffUrl } = useContext(ProviderContext);

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

      {getTiffUrl && (
        <DownloadBtn
          label="Export to TIFF"
          icon={FiDownload}
          filename="data.tiff"
          getDownloadUrl={() => getTiffUrl(dataset, selection)}
        />
      )}
      <SnapshotButton />
    </Toolbar>
  );
}

export default HeatmapToolbar;
