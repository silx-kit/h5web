import React from 'react';
import { AxisRight } from '@vx/axis';
import { useMeasure } from 'react-use';
import {
  adaptedNumTicks,
  generateCSSLinearGradient,
  ColorScale,
} from './utils';
import styles from './HeatmapVis.module.css';
import { useHeatmapState } from './store';

interface Props {
  colorScale: ColorScale;
}

function ColorBar(props: Props): JSX.Element {
  const { colorScale } = props;
  const { interpolator } = useHeatmapState();

  const [gradientRef, { height: gradientHeight }] = useMeasure();
  const scale = colorScale
    .copy()
    .range([gradientHeight, 0]) as typeof colorScale;

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
          scale={scale}
          hideAxisLine
          numTicks={adaptedNumTicks(gradientHeight)}
          tickFormat={scale.tickFormat(adaptedNumTicks(gradientHeight), '.3')}
        />
      </svg>
    </div>
  );
}

export default ColorBar;
