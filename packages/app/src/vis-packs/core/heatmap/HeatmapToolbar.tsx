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
import { MdAspectRatio } from 'react-icons/md';

import type { ExportFormat } from '../../../providers/models';
import { getImageInteractions } from '../utils';
import type { HeatmapConfig } from './config';

const EXPORT_FORMATS: ExportFormat[] = ['tiff', 'npy'];

interface Props {
  dataDomain: Domain;
  isSlice: boolean;
  config: HeatmapConfig;
  getExportURL: ((format: ExportFormat) => URL | undefined) | undefined;
}

function HeatmapToolbar(props: Props) {
  const { isSlice, dataDomain, config, getExportURL } = props;
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
          isSlice={isSlice}
          entries={EXPORT_FORMATS.map((format) => ({
            format,
            url: getExportURL(format),
          }))}
        />
      )}

      <SnapshotBtn />
    </Toolbar>
  );
}

export default HeatmapToolbar;
