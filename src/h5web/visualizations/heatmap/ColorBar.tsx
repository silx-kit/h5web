import React from 'react';
import { AxisRight } from '@vx/axis';
import { useMeasure } from 'react-use';
import { adaptedNumTicks } from '../shared/utils';
import styles from './HeatmapVis.module.css';
import { generateCSSLinearGradient } from './utils';
import { SCALE_FUNCTIONS, ScaleType, Domain } from '../shared/models';
import type { ColorMap } from './models';
import { INTERPOLATORS } from './interpolators';

interface Props {
  domain: Domain;
  scaleType: ScaleType;
  colorMap: ColorMap;
}

function ColorBar(props: Props): JSX.Element {
  const { domain, scaleType, colorMap } = props;
  const interpolator = INTERPOLATORS[colorMap];
  const [gradientRef, { height: gradientHeight }] = useMeasure();

  const axisScale = SCALE_FUNCTIONS[scaleType]();
  axisScale.domain(domain);
  axisScale.range([gradientHeight, 0]);

  return (
    <div className={styles.colorBar}>
      <div
        ref={gradientRef}
        className={styles.gradient}
        style={{
          backgroundImage: generateCSSLinearGradient(interpolator, 'top'),
        }}
      />
      {gradientHeight > 0 && (
        <svg
          className={styles.colorBarAxis}
          height={gradientHeight}
          width="2em"
        >
          <AxisRight
            scale={axisScale}
            hideAxisLine
            numTicks={adaptedNumTicks(gradientHeight)}
            tickFormat={axisScale.tickFormat(
              adaptedNumTicks(gradientHeight),
              '.3'
            )}
          />
        </svg>
      )}
    </div>
  );
}

export default ColorBar;
