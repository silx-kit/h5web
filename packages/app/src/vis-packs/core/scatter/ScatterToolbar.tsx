import type { Domain } from '@h5web/lib';
import {
  ColorMapSelector,
  DomainWidget,
  GridToggler,
  ScaleSelector,
  Separator,
  Toolbar,
} from '@h5web/lib';
import { AXIS_SCALE_TYPES, COLOR_SCALE_TYPES } from '@h5web/shared';

import { BASE_INTERACTIONS } from '../utils';
import type { ScatterConfig } from './config';

interface Props {
  dataDomain: Domain;
  config: ScatterConfig;
}

function ScatterToolbar(props: Props) {
  const { dataDomain, config } = props;
  const {
    customDomain,
    colorMap,
    scaleType,
    showGrid,
    invertColorMap,
    xScaleType,
    yScaleType,
    setCustomDomain,
    setColorMap,
    setScaleType,
    toggleGrid,
    toggleColorMapInversion,
    setXScaleType,
    setYScaleType,
  } = config;

  return (
    <Toolbar interactions={BASE_INTERACTIONS}>
      <ScaleSelector
        label="X"
        value={xScaleType}
        onScaleChange={setXScaleType}
        options={AXIS_SCALE_TYPES}
      />
      <ScaleSelector
        label="Y"
        value={yScaleType}
        onScaleChange={setYScaleType}
        options={AXIS_SCALE_TYPES}
      />

      <Separator />

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

      <GridToggler value={showGrid} onToggle={toggleGrid} />
    </Toolbar>
  );
}

export default ScatterToolbar;
