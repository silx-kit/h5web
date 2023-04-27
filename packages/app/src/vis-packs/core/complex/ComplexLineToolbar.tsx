import {
  CurveType,
  ScaleSelector,
  ScaleType,
  Selector,
  Separator,
  ToggleBtn,
  ToggleGroup,
  Toolbar,
} from '@h5web/lib';
import { MdDomain, MdGridOn } from 'react-icons/md';

import type { LineConfig } from '../line/config';
import { INTERACTIONS_WITH_AXIAL_ZOOM } from '../utils';
import type { ComplexLineConfig } from './lineConfig';
import type { ComplexLineVisType } from './models';
import { ComplexVisType, VIS_TYPE_SYMBOLS } from './models';

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
        options={[ScaleType.Linear, ScaleType.Log, ScaleType.SymLog]}
      />
      <ScaleSelector
        label="Y"
        value={yScaleType}
        onScaleChange={setYScaleType}
        options={[ScaleType.Linear, ScaleType.Log, ScaleType.SymLog]}
      />

      <Separator />

      <Selector
        value={visType}
        onChange={(value: ComplexLineVisType) => setVisType(value)}
        options={[ComplexVisType.Amplitude, ComplexVisType.Phase]}
        optionComponent={({ option }) => (
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <>{`${VIS_TYPE_SYMBOLS[option]} ${option}`}</>
        )}
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
