import type { Domain } from '@h5web/lib';
import {
  ColorMapSelector,
  ComplexVisTypeSelector,
  DomainWidget,
  ScaleSelector,
  Separator,
  SnapshotBtn,
  ToggleBtn,
  Toolbar,
} from '@h5web/lib';
import { ComplexVisType } from '@h5web/shared/vis-models';
import { COLOR_SCALE_TYPES } from '@h5web/shared/vis-utils';
import { MdAspectRatio, MdGridOn } from 'react-icons/md';

import type { HeatmapConfig } from '../heatmap/config';
import { getImageInteractions } from '../utils';
import type { ComplexConfig } from './config';

interface Props {
  dataDomain: Domain;
  config: ComplexConfig;
  heatmapConfig: HeatmapConfig;
}

function ComplexToolbar(props: Props) {
  const { dataDomain, config, heatmapConfig } = props;

  const { visType, setVisType } = config;
  const {
    customDomain,
    colorMap,
    scaleType,
    keepRatio,
    showGrid,
    invertColorMap,
    setCustomDomain,
    setColorMap,
    setScaleType,
    toggleKeepRatio,
    toggleGrid,
    toggleColorMapInversion,
  } = heatmapConfig;

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

      <ComplexVisTypeSelector
        value={visType}
        onChange={setVisType}
        options={Object.values(ComplexVisType)}
      />

      <Separator />

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

      <SnapshotBtn />
    </Toolbar>
  );
}

export default ComplexToolbar;
