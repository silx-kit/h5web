import type { Domain } from '@h5web/lib';
import {
  ColorMapSelector,
  DomainSlider,
  ScaleSelector,
  ScaleType,
  Separator,
  SnapshotBtn,
  Toolbar,
} from '@h5web/lib';

import type { SurfaceConfig } from './config';

interface Props {
  dataDomain: Domain;
  config: SurfaceConfig;
}

function SurfaceToolbar(props: Props) {
  const { dataDomain, config } = props;
  const {
    customDomain,
    colorMap,
    scaleType,
    invertColorMap,
    setCustomDomain,
    setColorMap,
    setScaleType,
    toggleColorMapInversion,
  } = config;

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

      <SnapshotBtn />
    </Toolbar>
  );
}

export default SurfaceToolbar;
