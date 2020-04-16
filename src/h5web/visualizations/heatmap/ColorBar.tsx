import React from 'react';
import { AxisRight } from '@vx/axis';
import { useMeasure } from 'react-use';
import { adaptedNumTicks, generateCSSLinearGradient } from './utils';
import styles from './HeatmapVis.module.css';
import { useHeatmapState } from './store';

function ColorBar(): JSX.Element {
  const { dataScale, interpolator } = useHeatmapState();
  const [gradientRef, { height: gradientHeight }] = useMeasure();

  if (!dataScale) {
    return <></>;
  }

  const axisScale = dataScale.copy();
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
      <svg className={styles.colorBarAxis} height={gradientHeight} width="2em">
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
    </div>
  );
}

export default ColorBar;
