import {
  Toolbar,
  Separator,
  Selector,
  ToggleBtn,
  ColorMapSelector,
  DomainSlider,
  ScaleSelector,
} from '@h5web/lib';
import { ScaleType } from '@h5web/shared';
import { MdAspectRatio, MdGridOn } from 'react-icons/md';
import shallow from 'zustand/shallow';

import { useComplexConfig } from '../vis-packs/core/complex/config';
import {
  ComplexVisType,
  VIS_TYPE_SYMBOLS,
} from '../vis-packs/core/complex/models';
import { useHeatmapConfig } from '../vis-packs/core/heatmap/config';
import SnapshotButton from './controls/SnapshotButton';

function ComplexToolbar() {
  const {
    dataDomain,
    customDomain,
    setCustomDomain,
    colorMap,
    setColorMap,
    scaleType,
    staleDomainScaleType,
    setScaleType,
    layout,
    setLayout,
    showGrid,
    toggleGrid,
    invertColorMap,
    toggleColorMapInversion,
  } = useHeatmapConfig((state) => state, shallow);
  const { visType, setVisType } = useComplexConfig((state) => state, shallow);

  return (
    <Toolbar>
      {dataDomain && (
        <>
          <DomainSlider
            dataDomain={dataDomain}
            customDomain={customDomain}
            scaleType={staleDomainScaleType || scaleType}
            onCustomDomainChange={setCustomDomain}
          />
          <Separator />
        </>
      )}

      <ColorMapSelector
        value={colorMap}
        onValueChange={setColorMap}
        invert={invertColorMap}
        onInversionChange={toggleColorMapInversion}
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

      <SnapshotButton />
    </Toolbar>
  );
}

export default ComplexToolbar;
