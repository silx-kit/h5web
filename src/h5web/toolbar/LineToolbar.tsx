import type { ReactElement } from 'react';
import { MdGridOn, MdDomain } from 'react-icons/md';
import ToggleBtn from './controls/ToggleBtn';
import { useLineConfig } from '../vis-packs/core/line/config';
import { CurveType } from '../vis-packs/core/line/models';
import ToggleGroup from './controls/ToggleGroup';
import Toolbar, { ToolbarControl } from './Toolbar';
import Separator from './Separator';
import ScaleSelector from './controls/ScaleSelector';

interface Props {
  errorControl?: ToolbarControl;
}

function LineToolbar(props: Props): ReactElement {
  const { errorControl } = props;
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
    toggleAutoScale,
    isAutoScaleDisabled,
  } = useLineConfig();

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
        onChange={toggleAutoScale}
        disabled={isAutoScaleDisabled}
      />

      {errorControl}

      <ToggleBtn
        label="Grid"
        icon={MdGridOn}
        value={showGrid}
        onChange={toggleGrid}
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

export default LineToolbar;
