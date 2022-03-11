import type { Domain } from '@h5web/lib';
import {
  ColorMapSelector,
  DomainSlider,
  ScaleSelector,
  Selector,
  Separator,
  SnapshotBtn,
  ToggleBtn,
  Toolbar,
} from '@h5web/lib';
import { ScaleType } from '@h5web/shared';
import { useEffect } from 'react';
import { MdAspectRatio, MdGridOn } from 'react-icons/md';
import shallow from 'zustand/shallow';

import { useHeatmapConfig } from '../heatmap/config';
import { getImageInteractions } from '../utils';
import { useComplexConfig } from './config';
import { ComplexVisType, VIS_TYPE_SYMBOLS } from './models';

interface Props {
  dataDomain: Domain;
  initialScaleType: ScaleType | undefined;
}

function ComplexToolbar(props: Props) {
  const { dataDomain, initialScaleType } = props;

  const {
    customDomain,
    setCustomDomain,
    colorMap,
    setColorMap,
    scaleType,
    setScaleType,
    layout,
    setLayout,
    showGrid,
    toggleGrid,
    invertColorMap,
    toggleColorMapInversion,
  } = useHeatmapConfig((state) => state, shallow);

  const { visType, setVisType } = useComplexConfig((state) => state, shallow);

  useEffect(() => {
    if (initialScaleType) {
      setScaleType(initialScaleType);
    }
  }, [initialScaleType, setScaleType]);

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

      <Selector
        value={visType}
        onChange={(value: ComplexVisType) => setVisType(value)}
        options={Object.values(ComplexVisType)}
        optionComponent={({ option }) => (
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <>{`${VIS_TYPE_SYMBOLS[option]} ${option}`}</>
        )}
      />

      <Separator />

      <ToggleBtn
        label="Keep ratio"
        icon={MdAspectRatio}
        value={layout === 'cover'}
        onToggle={() => setLayout(layout === 'cover' ? 'fill' : 'cover')}
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
