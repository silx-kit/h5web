import type { Domain } from '@h5web/lib';
import {
  ColorMapSelector,
  DomainSlider,
  GridToggler,
  ScaleSelector,
  ScaleType,
  Separator,
  Toolbar,
} from '@h5web/lib';

import { BASE_INTERACTIONS } from '../utils';
import type { ScatterConfig } from './config';

const SCALETYPE_OPTIONS = [ScaleType.Linear, ScaleType.Log, ScaleType.SymLog];

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
        options={SCALETYPE_OPTIONS}
      />
      <ScaleSelector
        label="Y"
        value={yScaleType}
        onScaleChange={setYScaleType}
        options={SCALETYPE_OPTIONS}
      />

      <Separator />

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

      <GridToggler value={showGrid} onToggle={toggleGrid} />
    </Toolbar>
  );
}

export default ScatterToolbar;
