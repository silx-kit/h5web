import type { Domain } from '@h5web/lib';
import {
  ColorMapSelector,
  DomainSlider,
  ExportMenu,
  FlipYAxisToggler,
  GridToggler,
  ScaleSelector,
  ScaleType,
  Separator,
  SnapshotBtn,
  ToggleBtn,
  Toolbar,
} from '@h5web/lib';
import type { ArrayShape, Dataset, NumericType } from '@h5web/shared';
import { MdAspectRatio } from 'react-icons/md';

import { useDataContext } from '../../../providers/DataProvider';
import type { ExportFormat } from '../../../providers/models';
import { getImageInteractions } from '../utils';
import type { HeatmapConfig } from './config';

const EXPORT_FORMATS: ExportFormat[] = ['tiff', 'npy'];

interface Props {
  dataset: Dataset<ArrayShape, NumericType>;
  dataDomain: Domain;
  selection: string | undefined;
  config: HeatmapConfig;
}

function HeatmapToolbar(props: Props) {
  const { dataset, dataDomain, selection, config } = props;
  const {
    customDomain,
    colorMap,
    scaleType,
    layout,
    showGrid,
    invertColorMap,
    flipYAxis,
    setCustomDomain,
    setColorMap,
    setScaleType,
    setLayout,
    toggleGrid,
    toggleColorMapInversion,
    toggleYAxisFlip,
  } = config;

  const { getExportURL } = useDataContext();

  return (
    <Toolbar interactions={getImageInteractions(layout)}>
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

      {getExportURL && (
        <ExportMenu
          formats={EXPORT_FORMATS}
          isSlice={selection !== undefined}
          getFormatURL={(format: ExportFormat) =>
            getExportURL(dataset, selection, format)
          }
        />
      )}

      <SnapshotBtn />
    </Toolbar>
  );
}

export default HeatmapToolbar;
