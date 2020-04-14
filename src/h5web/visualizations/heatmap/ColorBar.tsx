import React from 'react';
import { scaleLinear } from 'd3-scale';
import { AxisRight } from '@vx/axis';
import { useMeasure } from 'react-use';
import { adaptedNumTicks, generateCSSLinearGradient } from './utils';
import styles from './HeatmapVis.module.css';

interface Props {
  className: string;
  interpolator: (t: number) => string;
  dataBounds: [number, number];
}

function ColorBar(props: Props): JSX.Element {
  const { className, interpolator, dataBounds } = props;

  const [gradientRef, { height: gradientHeight }] = useMeasure();

  return (
    <div className={className}>
      <div
        ref={gradientRef}
        className={styles.gradient}
        style={{
          backgroundImage: generateCSSLinearGradient(interpolator, 'top'),
        }}
      />
      <svg className={styles.colorBarAxis} height={gradientHeight} width="2em">
        <AxisRight
          scale={scaleLinear()
            .domain(dataBounds)
            .range([gradientHeight, 0])
            .nice()}
          strokeWidth={0}
          numTicks={adaptedNumTicks(gradientHeight)}
        />
      </svg>
    </div>
  );
}

export default ColorBar;
