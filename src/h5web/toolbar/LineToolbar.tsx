import React, { ReactElement } from 'react';
import { MdGridOn, MdDomain } from 'react-icons/md';
import ToggleBtn from './controls/ToggleBtn';
import { useLineConfig } from '../visualizations/line/config';
import { CurveType } from '../visualizations/line/models';
import ToggleGroup from './controls/ToggleGroup';
import Toolbar from './Toolbar';
import Separator from './Separator';
import ScaleSelector from './controls/ScaleSelector';

function LineToolbar(): ReactElement {
  const {
    curveType,
    setCurveType,
    showGrid,
    toggleGrid,
    scaleType,
    setScaleType,
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
        onChange={setCurveType}
      >
        <ToggleGroup.Btn label="Line" value={CurveType.LineOnly} />
        <ToggleGroup.Btn label="Points" value={CurveType.GlyphsOnly} />
        <ToggleGroup.Btn label="Both" value={CurveType.LineAndGlyphs} />
      </ToggleGroup>

      <Separator />

      <ScaleSelector value={scaleType} onScaleChange={setScaleType} />

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
    </Toolbar>
  );
}

export default LineToolbar;
