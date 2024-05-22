import {
  ComplexVisTypeSelector,
  CurveType,
  ScaleSelector,
  Separator,
  ToggleBtn,
  ToggleGroup,
  Toolbar,
} from '@h5web/lib';
import { ComplexVisType } from '@h5web/shared/vis-models';
import { AXIS_SCALE_TYPES } from '@h5web/shared/vis-utils';
import { MdDomain, MdGridOn } from 'react-icons/md';

import type { LineConfig } from '../line/config';
import { INTERACTIONS_WITH_AXIAL_ZOOM } from '../utils';
import type { ComplexLineConfig } from './lineConfig';

interface Props {
  disableAutoScale: boolean;
  config: ComplexLineConfig;
  lineConfig: LineConfig;
}

function ComplexLineToolbar(props: Props) {
  const { disableAutoScale, config, lineConfig } = props;
  const { visType, setVisType } = config;
  const {
    curveType,
    showGrid,
    xScaleType,
    yScaleType,
    autoScale,
    setCurveType,
    toggleGrid,
    setXScaleType,
    setYScaleType,
    toggleAutoScale,
  } = lineConfig;

  return (
    <Toolbar interactions={INTERACTIONS_WITH_AXIAL_ZOOM}>
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

      <ComplexVisTypeSelector
        value={visType}
        onChange={setVisType}
        options={[ComplexVisType.Amplitude, ComplexVisType.Phase]}
      />

      <Separator />

      <ToggleBtn
        label="Auto-scale"
        icon={MdDomain}
        value={!disableAutoScale && autoScale}
        onToggle={toggleAutoScale}
        disabled={disableAutoScale}
      />

      <ToggleBtn
        label="Grid"
        icon={MdGridOn}
        value={showGrid}
        onToggle={toggleGrid}
      />

      <Separator />

      <ToggleGroup
        role="radiogroup"
        ariaLabel="Curve type"
        value={curveType}
        onChange={(val) => {
          setCurveType(val as CurveType);
        }}
      >
        <ToggleGroup.Btn label="Line" value={CurveType.LineOnly} />
        <ToggleGroup.Btn label="Points" value={CurveType.GlyphsOnly} />
        <ToggleGroup.Btn label="Both" value={CurveType.LineAndGlyphs} />
      </ToggleGroup>
    </Toolbar>
  );
}

export default ComplexLineToolbar;
