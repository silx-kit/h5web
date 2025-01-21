import {
  ColorMapSelector,
  type Domain,
  DomainWidget,
  ExportMenu,
  ScaleSelector,
  Separator,
  SnapshotBtn,
  ToggleBtn,
  Toolbar,
} from '@h5web/lib';
import { COLOR_SCALE_TYPES } from '@h5web/shared/vis-utils';
import {
  MdAspectRatio,
  MdGridOn,
  MdSwapHoriz,
  MdSwapVert,
} from 'react-icons/md';

import { type ExportFormat, type ExportURL } from '../../../providers/models';
import { getImageInteractions } from '../utils';
import { type HeatmapConfig } from './config';

const EXPORT_FORMATS: ExportFormat[] = ['tiff', 'npy'];

interface Props {
  dataDomain: Domain;
  isSlice: boolean;
  config: HeatmapConfig;
  getExportURL: ((format: ExportFormat) => ExportURL) | undefined;
}

function HeatmapToolbar(props: Props) {
  const { isSlice, dataDomain, config, getExportURL } = props;
  const {
    customDomain,
    colorMap,
    scaleType,
    keepRatio,
    showGrid,
    invertColorMap,
    flipXAxis,
    flipYAxis,
    setCustomDomain,
    setColorMap,
    setScaleType,
    toggleKeepRatio,
    toggleGrid,
    toggleColorMapInversion,
    toggleXAxisFlip,
    toggleYAxisFlip,
  } = config;

  return (
    <Toolbar interactions={getImageInteractions(keepRatio)}>
      <DomainWidget
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
        options={COLOR_SCALE_TYPES}
      />

      <Separator />

      <ToggleBtn
        label="X"
        aria-label="Flip X"
        icon={MdSwapHoriz}
        value={flipXAxis}
        onToggle={toggleXAxisFlip}
      />
      <ToggleBtn
        label="Y"
        aria-label="Flip Y"
        icon={MdSwapVert}
        value={flipYAxis}
        onToggle={toggleYAxisFlip}
      />

      <ToggleBtn
        label="Keep ratio"
        icon={MdAspectRatio}
        value={keepRatio}
        onToggle={toggleKeepRatio}
      />

      <ToggleBtn
        label="Grid"
        icon={MdGridOn}
        value={showGrid}
        onToggle={toggleGrid}
      />

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
