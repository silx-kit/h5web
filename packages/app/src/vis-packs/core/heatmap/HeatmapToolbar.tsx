import {
  ColorMapSelector,
  ComplexVisTypeSelector,
  type Domain,
  DomainWidget,
  ExportMenu,
  ScaleSelector,
  Separator,
  SnapshotBtn,
  ToggleBtn,
  Toolbar,
} from '@h5web/lib';
import {
  COLOR_SCALE_TYPES,
  type ComplexHeatmapVisType,
  ComplexVisType,
  type ExportEntry,
} from '@h5web/shared/vis-models';
import {
  MdAspectRatio,
  MdGridOn,
  MdSwapHoriz,
  MdSwapVert,
  MdViewInAr,
} from 'react-icons/md';

import { getImageInteractions, SURFACE_INTERACTIONS } from '../utils';
import { type HeatmapConfig } from './config';
import HeightScaleSlider from './HeightScaleSlider';

const COMPLEX_VIS_TYPES: ComplexHeatmapVisType[] = [
  ComplexVisType.Amplitude,
  ComplexVisType.Phase,
  ComplexVisType.PhaseAmplitude,
];

interface Props {
  dataDomain: Domain;
  isSlice?: boolean;
  isComplex?: boolean;
  config: HeatmapConfig;
  exportEntries?: ExportEntry[];
}

function HeatmapToolbar(props: Props) {
  const { dataDomain, isSlice, isComplex, config, exportEntries } = props;
  const {
    customDomain,
    colorMap,
    invertColorMap,
    scaleType,
    complexVisType,
    showGrid,
    keepRatio,
    flipXAxis,
    flipYAxis,
    surface,
    heightScale,
    setCustomDomain,
    setColorMap,
    setInvertColorMap,
    setScaleType,
    setComplexVisType,
    setShowGrid,
    setKeepRatio,
    setFlipXAxis,
    setFlipYAxis,
    setSurface,
    setHeightScale,
  } = config;

  return (
    <Toolbar
      interactions={
        !isComplex && surface
          ? SURFACE_INTERACTIONS
          : getImageInteractions(keepRatio)
      }
    >
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
        onInversionChange={() => setInvertColorMap(!invertColorMap)}
      />

      <Separator />

      <ScaleSelector
        value={scaleType}
        onScaleChange={setScaleType}
        options={COLOR_SCALE_TYPES}
      />

      {isComplex && (
        <ComplexVisTypeSelector
          value={complexVisType}
          onChange={setComplexVisType}
          options={COMPLEX_VIS_TYPES}
        />
      )}

      <Separator />

      <ToggleBtn
        label="X"
        aria-label="Flip X"
        Icon={MdSwapHoriz}
        value={flipXAxis}
        onToggle={() => setFlipXAxis(!flipXAxis)}
      />
      <ToggleBtn
        label="Y"
        aria-label="Flip Y"
        Icon={MdSwapVert}
        value={flipYAxis}
        onToggle={() => setFlipYAxis(!flipYAxis)}
      />

      <ToggleBtn
        label="Keep ratio"
        Icon={MdAspectRatio}
        value={keepRatio}
        onToggle={() => setKeepRatio(!keepRatio)}
      />

      {!isComplex && (
        <ToggleBtn
          label="3D"
          aria-label="Show as 3D surface"
          Icon={MdViewInAr}
          value={surface}
          onToggle={() => setSurface(!surface)}
        />
      )}

      {!isComplex && surface && (
        <HeightScaleSlider value={heightScale} onChange={setHeightScale} />
      )}

      <ToggleBtn
        label="Grid"
        Icon={MdGridOn}
        value={showGrid}
        onToggle={() => setShowGrid(!showGrid)}
      />

      <Separator />

      {exportEntries && exportEntries.length > 0 && (
        <ExportMenu isSlice={isSlice} entries={exportEntries} />
      )}

      <SnapshotBtn />
    </Toolbar>
  );
}

export default HeatmapToolbar;
