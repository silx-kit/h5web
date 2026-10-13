import {
  ColorMapSelector,
  type Domain,
  DomainWidget,
  ScaleSelector,
  Selector,
  Separator,
  SnapshotBtn,
  ToggleGroup,
  Toolbar,
  VolumeQuality,
  VolumeRenderMode,
} from '@h5web/lib';
import { COLOR_SCALE_TYPES } from '@h5web/shared/vis-models';

import { type VolumeConfig } from './config';
import RangeControl from './RangeControl';

const QUALITY_LABELS: Record<VolumeQuality, string> = {
  [VolumeQuality.Low]: 'Low',
  [VolumeQuality.Medium]: 'Medium',
  [VolumeQuality.High]: 'High',
};

interface Props {
  dataDomain: Domain;
  config: VolumeConfig;
}

function VolumeToolbar(props: Props) {
  const { dataDomain, config } = props;
  const {
    customDomain,
    colorMap,
    scaleType,
    invertColorMap,
    mode,
    opacity,
    threshold,
    quality,
    setCustomDomain,
    setColorMap,
    setScaleType,
    setInvertColorMap,
    setMode,
    setOpacity,
    setThreshold,
    setQuality,
  } = config;

  return (
    <Toolbar>
      <ToggleGroup
        role="radiogroup"
        ariaLabel="Rendering mode"
        value={mode}
        onChange={(val) => setMode(val as VolumeRenderMode)}
      >
        <ToggleGroup.Btn
          label="MIP"
          value={VolumeRenderMode.MIP}
          hint="Maximum intensity projection"
        />
        <ToggleGroup.Btn
          label="DVR"
          value={VolumeRenderMode.DVR}
          hint="Direct volume rendering"
        />
        <ToggleGroup.Btn
          label="Iso"
          value={VolumeRenderMode.Iso}
          hint="Isosurface"
        />
      </ToggleGroup>
      <Separator />

      <RangeControl
        label={mode === VolumeRenderMode.Iso ? 'Iso value' : 'Threshold'}
        value={threshold}
        onChange={setThreshold}
      />
      {mode === VolumeRenderMode.DVR && (
        <RangeControl label="Opacity" value={opacity} onChange={setOpacity} />
      )}
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
        onInversionChange={() => setInvertColorMap(!invertColorMap)}
      />
      <Separator />

      <ScaleSelector
        value={scaleType}
        onScaleChange={setScaleType}
        options={COLOR_SCALE_TYPES}
      />
      <Separator />

      <Selector
        label="Quality"
        value={quality}
        onChange={setQuality}
        options={Object.values(VolumeQuality)}
        renderOption={(option) => QUALITY_LABELS[option]}
      />
      <Separator />

      <SnapshotBtn />
    </Toolbar>
  );
}

export default VolumeToolbar;
