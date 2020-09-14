import React from 'react';
import { MdGridOn } from 'react-icons/md';
import ToggleBtn from '../shared/ToggleBtn';
import { useLineConfig } from './config';
import { CurveType } from './models';
import ToggleGroup from '../shared/ToggleGroup';
import Toolbar from '../shared/Toolbar';
import Separator from '../shared/Separator';
import ScaleSelector from '../shared/ScaleSelector';

function LineToolbar(): JSX.Element {
  const {
    curveType,
    setCurveType,
    showGrid,
    toggleGrid,
    scaleType,
    setScaleType,
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
        label="Grid"
        icon={MdGridOn}
        value={showGrid}
        onChange={toggleGrid}
      />
    </Toolbar>
  );
}

export default LineToolbar;
