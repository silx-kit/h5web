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
import { useEffect } from 'react';
import shallow from 'zustand/shallow';

import { BASE_INTERACTIONS } from '../utils';
import { useScatterConfig } from './config';

interface Props {
  dataDomain: Domain;
  initialScaleType: ScaleType | undefined;
}

function ScatterToolbar(props: Props) {
  const { dataDomain, initialScaleType } = props;

  const {
    customDomain,
    setCustomDomain,
    colorMap,
    setColorMap,
    scaleType,
    setScaleType,
    showGrid,
    toggleGrid,
    invertColorMap,
    toggleColorMapInversion,
  } = useScatterConfig((state) => state, shallow);

  useEffect(() => {
    if (initialScaleType) {
      setScaleType(initialScaleType);
    }
  }, [initialScaleType, setScaleType]);

  return (
    <Toolbar interactions={BASE_INTERACTIONS}>
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
