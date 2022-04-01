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

const SCALETYPE_OPTIONS = [ScaleType.Linear, ScaleType.Log, ScaleType.SymLog];

interface Props {
  dataDomain: Domain;
  initialScaleType: ScaleType | undefined;
  initialXScaleType: ScaleType | undefined;
  initialYScaleType: ScaleType | undefined;
}

function ScatterToolbar(props: Props) {
  const { dataDomain, initialScaleType, initialXScaleType, initialYScaleType } =
    props;

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
    xScaleType,
    setXScaleType,
    yScaleType,
    setYScaleType,
  } = useScatterConfig((state) => state, shallow);

  useEffect(() => {
    if (initialScaleType) {
      setScaleType(initialScaleType);
    }
  }, [initialScaleType, setScaleType]);

  useEffect(() => {
    if (initialXScaleType) {
      setXScaleType(initialXScaleType);
    }
  }, [initialXScaleType, setXScaleType]);

  useEffect(() => {
    if (initialYScaleType) {
      setYScaleType(initialYScaleType);
    }
  }, [initialYScaleType, setYScaleType]);

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
