import React from 'react';
import { MdGridOn, MdLinearScale } from 'react-icons/md';
import Toggler from '../shared/Toggler';
import { useLineConfig } from './config';
import { CurveType } from './models';
import styles from './LineToolbar.module.css';
import ButtonGroup from '../shared/ButtonGroup';
import Toolbar from '../shared/Toolbar';

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
      <Toggler
        label="Symlog"
        icon={MdLinearScale}
        value={hasYLogScale}
        onChange={toggleYLogScale}
      />
      <Toggler
        label="Grid"
        icon={MdGridOn}
        value={showGrid}
        onChange={toggleGrid}
      />
    </Toolbar>
  );
}

export default LineToolbar;
