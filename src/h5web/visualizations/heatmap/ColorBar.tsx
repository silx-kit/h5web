import React, { ReactElement } from 'react';
import { AxisRight, AxisBottom } from '@vx/axis';
import { useMeasure } from 'react-use';
import { adaptedNumTicks } from '../shared/utils';
import styles from './ColorBar.module.css';
import { generateCSSLinearGradient } from './utils';
import { SCALE_FUNCTIONS, ScaleType, Domain } from '../shared/models';
import type { ColorMap } from './models';
import { INTERPOLATORS } from './interpolators';

interface Props {
  domain: Domain;
  scaleType: ScaleType;
  colorMap: ColorMap;
  horizontal?: boolean;
}

function ColorBar(props: Props): ReactElement {
  const { domain, scaleType, colorMap, horizontal } = props;
  const interpolator = INTERPOLATORS[colorMap];
  const [
    gradientRef,
    { height: gradientHeight, width: gradientWidth },
  ] = useMeasure();

  const gradientLength = horizontal ? gradientWidth : gradientHeight;
  const Axis = horizontal ? AxisBottom : AxisRight;

  const axisScale = SCALE_FUNCTIONS[scaleType]();
  axisScale.domain(domain);
  axisScale.range(horizontal ? [0, gradientWidth] : [gradientHeight, 0]);

  return (
    <div className={styles.colorBar} data-horizontal={horizontal || undefined}>
      <div
        ref={gradientRef}
        className={styles.gradient}
        style={{
          backgroundImage: generateCSSLinearGradient(
            interpolator,
            horizontal ? 'right' : 'top'
          ),
        }}
      />
      {gradientLength > 0 && (
        <svg
          className={styles.colorBarAxis}
          height={horizontal ? '2em' : gradientHeight}
          width={horizontal ? gradientWidth : '2em'}
        >
          <Axis
            scale={axisScale}
            hideAxisLine
            numTicks={adaptedNumTicks(gradientLength)}
            tickFormat={axisScale.tickFormat(
              adaptedNumTicks(gradientLength),
              '.3'
            )}
          />
        </svg>
      )}
    </div>
  );
}

export default ColorBar;
