import React from 'react';
import { useMeasure } from 'react-use';
import { AxisLeft, AxisBottom } from '@vx/axis';
import { format } from 'd3-format';
import { scaleLinear } from 'd3-scale';
import styles from './AxisGrid.module.css';
import { adaptedNumTicks } from './utils';
import { Domain } from './models';

type Orientation = 'bottom' | 'left';

interface Props {
  className: string;
  domain: Domain;
  orientation: Orientation;
}

function Axis(props: Props): JSX.Element {
  const { className, domain, orientation } = props;

  const [min, max] = domain;
  const isLeftAxis = orientation === 'left';
  const DirectionalAxis = isLeftAxis ? AxisLeft : AxisBottom;

  const [divRef, { width, height }] = useMeasure();
  const isVisible = width > 0 && height > 0;

  const scale = scaleLinear()
    .domain(domain)
    .range(isLeftAxis ? [height, 0] : [0, width]);

  const numTicks = Math.min(
    max - min,
    adaptedNumTicks(isLeftAxis ? height : width)
  );

  return (
    <div ref={divRef} className={className}>
      {isVisible && (
        <svg className={styles.axis} data-orientation={orientation}>
          <DirectionalAxis
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
      )}
    </div>
  );
}

export default Axis;
