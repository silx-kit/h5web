import React from 'react';
import { useMeasure } from 'react-use';
import { Axis } from '@vx/axis';
import { format } from 'd3-format';
import { scaleLinear } from 'd3-scale';
import styles from './HeatmapVis.module.css';
import { adaptedNumTicks } from './utils';

type Orientation = 'bottom' | 'left';

interface Props {
  orientation: Orientation;
  className: string;
  numberPixels: number;
}

function IndexAxis(props: Props): JSX.Element {
  const { orientation, numberPixels, className } = props;
  const [divRef, { width, height }] = useMeasure();
  const isLeftAxis = orientation === 'left';

  const numTicks = isLeftAxis
    ? adaptedNumTicks(height)
    : adaptedNumTicks(width);

  return (
    <div ref={divRef} className={className}>
      <svg className={styles.axis} data-orientation={orientation}>
        <Axis
          scale={scaleLinear()
            .domain([-0.5, numberPixels - 0.5])
            .range(isLeftAxis ? [height, 0] : [0, width])}
          left={isLeftAxis ? width : 0}
          orientation={orientation}
          strokeWidth={0}
          tickFormat={format('0')}
          numTicks={Math.min(numberPixels, numTicks)}
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          tickLabelProps={(value, index) =>
            isLeftAxis
              ? { className: styles.tick, dx: '-0.25em' }
              : { className: styles.tick, dy: '0.25em' }
          }
        />
      </svg>
    </div>
  );
}

export default IndexAxis;
