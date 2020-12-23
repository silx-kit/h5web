import type { ReactElement } from 'react';
import { MdGridOn, MdDomain } from 'react-icons/md';
import ToggleBtn from './controls/ToggleBtn';
import { useLineConfig } from '../visualizations/line/config';
import { CurveType } from '../visualizations/line/models';
import ToggleGroup from './controls/ToggleGroup';
import Toolbar, { ToolbarProps } from './Toolbar';
import Separator from './Separator';
import ScaleSelector from './controls/ScaleSelector';

function LineToolbar(props: ToolbarProps): ReactElement {
  const { children } = props;
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

      <Separator />

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
      <ToggleBtn
        label="Grid"
        icon={MdGridOn}
        value={showGrid}
        onChange={toggleGrid}
      />

      {
        children as any // eslint-disable-line @typescript-eslint/no-explicit-any
      }
    </Toolbar>
  );
}

export default LineToolbar;
