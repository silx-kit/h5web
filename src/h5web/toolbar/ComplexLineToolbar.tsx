import { MdGridOn, MdDomain } from 'react-icons/md';
import { FiItalic } from 'react-icons/fi';
import ToggleBtn from './controls/ToggleBtn';
import { useLineConfig } from '../vis-packs/core/line/config';
import { CurveType } from '../vis-packs/core/line/models';
import ToggleGroup from './controls/ToggleGroup';
import Toolbar from './Toolbar';
import Separator from './Separator';
import ScaleSelector from './controls/ScaleSelector/ScaleSelector';
import shallow from 'zustand/shallow';
import { useComplexLineConfig } from '../vis-packs/core/complex/lineConfig';
import Selector from './controls/Selector/Selector';
import {
  ComplexLineVisType,
  ComplexVisType,
  VIS_TYPE_SYMBOLS,
} from '../vis-packs/core/complex/models';

function ComplexLineToolbar() {
  const {
    curveType,
    setCurveType,
    showGrid,
    toggleGrid,
    xScaleType,
    setXScaleType,
    yScaleType,
    setYScaleType,
    autoScale,
    isAutoScaleDisabled,
    toggleAutoScale,
    showErrors,
    areErrorsDisabled,
    toggleErrors,
  } = useLineConfig((state) => state, shallow);
  const { visType, setVisType } = useComplexLineConfig(
    (state) => state,
    shallow
  );

  return (
    <Toolbar>
      <ScaleSelector
        label="X"
        value={xScaleType}
        onScaleChange={setXScaleType}
      />
      <ScaleSelector
        label="Y"
        value={yScaleType}
        onScaleChange={setYScaleType}
      />

      <Separator />

      <ToggleBtn
        label="Auto-scale"
        icon={MdDomain}
        value={autoScale}
        onToggle={toggleAutoScale}
        disabled={isAutoScaleDisabled}
      />

      <ToggleBtn
        label="Errors"
        icon={(props) => (
          <FiItalic
            transform="skewX(20)"
            style={{ marginLeft: '-0.25em', marginRight: '0.0625rem' }}
            {...props}
          />
        )}
        value={!areErrorsDisabled && showErrors}
        onToggle={toggleErrors}
        disabled={areErrorsDisabled}
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

      <Selector
        value={visType}
        onChange={(value: ComplexLineVisType) => setVisType(value)}
        options={[ComplexVisType.Amplitude, ComplexVisType.Phase]}
        optionComponent={({ option }) => (
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <>{`${VIS_TYPE_SYMBOLS[option]} ${option}`}</>
        )}
      />
    </Toolbar>
  );
}

export default ComplexLineToolbar;
