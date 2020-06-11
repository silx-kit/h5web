import React from 'react';
import { MdGridOn, MdGraphicEq, MdSort, MdFilterList } from 'react-icons/md';
import ToggleBtn from '../shared/ToggleBtn';
import { useLineConfig } from './config';
import { CurveType } from './models';
import ToggleGroup from '../shared/ToggleGroup';
import Toolbar from '../shared/Toolbar';
import Separator from '../shared/Separator';
import { ScaleType } from '../shared/models';

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

      <ToggleGroup
        role="radiogroup"
        ariaLabel="Scale type"
        value={scaleType}
        onChange={setScaleType}
      >
        <ToggleGroup.Btn
          icon={MdSort}
          label="Linear"
          value={ScaleType.Linear}
        />
        <ToggleGroup.Btn
          icon={MdFilterList}
          label="Log"
          value={ScaleType.Log}
        />
        <ToggleGroup.Btn
          icon={(props) => <MdGraphicEq {...props} transform="rotate(90)" />}
          label="SymLog"
          value={ScaleType.SymLog}
        />
      </ToggleGroup>

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
