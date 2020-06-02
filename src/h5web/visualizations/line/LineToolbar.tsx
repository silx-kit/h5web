import React from 'react';
import { MdGridOn, MdLinearScale } from 'react-icons/md';
import ToggleBtn from '../shared/ToggleBtn';
import { useLineConfig } from './config';
import { CurveType } from './models';
import ToggleGroup from '../shared/ToggleGroup';
import Toolbar from '../shared/Toolbar';
import Separator from '../shared/Separator';

function LineToolbar(): JSX.Element {
  const {
    curveType,
    setCurveType,
    showGrid,
    toggleGrid,
    hasYLogScale,
    toggleYLogScale,
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

      <ToggleBtn
        label="Symlog"
        icon={MdLinearScale}
        value={hasYLogScale}
        onChange={toggleYLogScale}
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
