import React from 'react';
import { AxisRight } from '@vx/axis';
import { useMeasure } from 'react-use';
import { adaptedNumTicks, generateCSSLinearGradient } from './utils';
import styles from './HeatmapVis.module.css';
import { useHeatmapState, DataScale } from './store';

interface Props {
  dataScale: DataScale;
}

function ColorBar(props: Props): JSX.Element {
  const { dataScale } = props;
  const { interpolator } = useHeatmapState();

  const [gradientRef, { height: gradientHeight }] = useMeasure();

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
