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
import { type ExportEntry } from '@h5web/shared/vis-models';
import { COLOR_SCALE_TYPES } from '@h5web/shared/vis-utils';
import {
  MdAspectRatio,
  MdGridOn,
  MdSwapHoriz,
  MdSwapVert,
} from 'react-icons/md';

import { getImageInteractions } from '../utils';
import { type HeatmapConfig } from './config';

interface Props {
  dataDomain: Domain;
  isSlice: boolean;
  config: HeatmapConfig;
  exportEntries: ExportEntry[];
}

function HeatmapToolbar(props: Props) {
  const { isSlice, dataDomain, config, exportEntries } = props;
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
        Icon={MdSwapHoriz}
        value={flipXAxis}
        onToggle={toggleXAxisFlip}
      />
      <ToggleBtn
        label="Y"
        aria-label="Flip Y"
        Icon={MdSwapVert}
        value={flipYAxis}
        onToggle={toggleYAxisFlip}
      />

      <ToggleBtn
        label="Keep ratio"
        Icon={MdAspectRatio}
        value={keepRatio}
        onToggle={toggleKeepRatio}
      />

      <ToggleBtn
        label="Grid"
        Icon={MdGridOn}
        value={showGrid}
        onToggle={toggleGrid}
      />

      <Separator />

      {exportEntries.length > 0 && (
        <ExportMenu isSlice={isSlice} entries={exportEntries} />
      )}

      <SnapshotBtn />
    </Toolbar>
  );
}

export default HeatmapToolbar;
