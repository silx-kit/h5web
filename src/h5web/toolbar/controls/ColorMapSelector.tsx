import React, { ReactElement } from 'react';
import { Wrapper, Button, Menu, MenuItem } from 'react-aria-menubutton';

import { MdArrowDropDown } from 'react-icons/md';
import { useWindowSize } from 'react-use';
import styles from './ColorMapSelector.module.css';
import {
  INTERPOLATOR_GROUPS,
  INTERPOLATORS,
} from '../../visualizations/heatmap/interpolators';
import type {
  ColorMap,
  D3Interpolator,
} from '../../visualizations/heatmap/models';
import { generateCSSLinearGradient } from '../../visualizations/heatmap/utils';

const MENU_IDEAL_HEIGHT = 320; // 20rem
const MENU_TOP = 87; // HACK: height of breadcrumbs bar + height of toolbar
const MENU_BOTTOM = 16; // offset from bottom of viewport

interface GradientProps {
  interpolator: D3Interpolator;
}

function Gradient(props: GradientProps): JSX.Element {
  const { interpolator } = props;
  const backgroundImage = generateCSSLinearGradient(interpolator, 'right');
  return <div className={styles.gradient} style={{ backgroundImage }} />;
}

interface Props {
  value: ColorMap;
  disabled?: boolean;
  onChange(colorMap: ColorMap): void;
}

function ColorMapSelector(props: Props): ReactElement {
  const { value, disabled, onChange } = props;

  const { height: winHeight } = useWindowSize();
  const menuMaxHeight = winHeight - MENU_TOP - MENU_BOTTOM;

  return (
    <Wrapper className={styles.wrapper} onSelection={onChange}>
      <Button className={styles.btn} tag="button" disabled={disabled}>
        <div className={styles.btnLike}>
          <span className={styles.selectedColorMap}>
            {value}
            <Gradient interpolator={INTERPOLATORS[value]} />
          </span>
          <MdArrowDropDown className={styles.icon} />
        </div>
      </Button>

      <Menu
        className={styles.menu}
        style={{ maxHeight: Math.min(MENU_IDEAL_HEIGHT, menuMaxHeight) }}
      >
        <ul className={styles.list}>
          {Object.entries(INTERPOLATOR_GROUPS).map(
            ([groupLabel, interpolators]) => (
              <li key={groupLabel}>
                <span className={styles.groupLabel}>{groupLabel}</span>
                <ul className={styles.list}>
                  {Object.entries(interpolators).map(
                    ([colorMap, interpolator]) => (
                      <li key={colorMap}>
                        <MenuItem
                          className={styles.option}
                          text={colorMap}
                          value={colorMap}
                          data-selected={colorMap === value || undefined}
                        >
                          {colorMap}
                          <Gradient interpolator={interpolator} />
                        </MenuItem>
                      </li>
                    )
                  )}
                </ul>
              </li>
            )
          )}
        </ul>
      </Menu>
    </Wrapper>
  );
}

export default ColorMapSelector;
