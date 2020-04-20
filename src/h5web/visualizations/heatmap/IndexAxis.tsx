import React from 'react';
import { useMeasure } from 'react-use';
import { AxisLeft, AxisBottom } from '@vx/axis';
import { format } from 'd3-format';
import { scaleLinear } from 'd3-scale';
import styles from './HeatmapVis.module.css';
import { adaptedNumTicks } from './utils';
import { Domain } from './store';

type Orientation = 'bottom' | 'left';

interface Props {
  className: string;
  domain: Domain;
  orientation: Orientation;
}

function IndexAxis(props: Props): JSX.Element {
  const { className, domain, orientation } = props;
  const [divRef, { width, height }] = useMeasure();

  const [min, max] = domain;
  const isLeftAxis = orientation === 'left';
  const Axis = isLeftAxis ? AxisLeft : AxisBottom;

  const scale = scaleLinear()
    .domain([min - 0.5, max - 0.5])
    .range(isLeftAxis ? [height, 0] : [0, width]);

  const numTicks = Math.min(
    max - min,
    adaptedNumTicks(isLeftAxis ? height : width)
  );

  return (
    <div ref={divRef} className={className}>
      <svg className={styles.axis} data-orientation={orientation}>
        <Axis
          scale={scale}
          left={isLeftAxis ? width : 0}
          numTicks={numTicks}
          hideAxisLine
          tickFormat={format('0')}
          tickClassName={styles.tick}
          tickComponent={({ formattedValue, ...tickProps }) => (
            <text {...tickProps}>{formattedValue}</text>
          )}
        />
      </svg>
    </div>
  );
}

export default IndexAxis;
