import React from 'react';
import shallow from 'zustand/shallow';
import Toggler from '../shared/Toggler';
import { useLineConfig } from './config';
import { CurveType } from './models';
import styles from './LineToolbar.module.css';
import ButtonGroup from '../shared/ButtonGroup';

function LineToolbar(): JSX.Element {
  const [
    curveType,
    setCurveType,
    showGrid,
    toggleGrid,
    hasYLogScale,
    toggleYLogScale,
  ] = useLineConfig(
    state => [
      state.curveType,
      state.setCurveType,
      state.showGrid,
      state.toggleGrid,
      state.hasYLogScale,
      state.toggleYLogScale,
    ],
    shallow
  );

  return (
    <>
      <ButtonGroup
        className={styles.curveTypeButtonGroup}
        buttonClassName={styles.btn}
        ariaLabel="Curve type"
        buttons={[
          {
            label: 'Line',
            isSelected: curveType === CurveType.OnlyLine,
            onClick: () => setCurveType(CurveType.OnlyLine),
          },
          {
            label: 'Points',
            isSelected: curveType === CurveType.OnlyGlyphs,
            onClick: () => setCurveType(CurveType.OnlyGlyphs),
          },
          {
            label: 'Line and points',
            isSelected: curveType === CurveType.LineAndGlyphs,
            onClick: () => setCurveType(CurveType.LineAndGlyphs),
          },
        ]}
      />
      <Toggler label="Show grid" value={showGrid} onChange={toggleGrid} />
      <Toggler
        label="Y SymLog scale"
        value={hasYLogScale}
        onChange={toggleYLogScale}
      />
    </>
  );
}

export default LineToolbar;
