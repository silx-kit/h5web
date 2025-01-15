import {
  ColorMapSelector,
  type Domain,
  DomainWidget,
  ScaleSelector,
  Separator,
  SnapshotBtn,
  Toolbar,
} from '@h5web/lib';
import { COLOR_SCALE_TYPES } from '@h5web/shared/vis-utils';

import { type SurfaceConfig } from './config';

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

      <SnapshotBtn />
    </Toolbar>
  );
}

export default SurfaceToolbar;
