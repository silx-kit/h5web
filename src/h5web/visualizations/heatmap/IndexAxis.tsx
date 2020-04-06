import React from 'react';
import useMeasure from 'react-use-measure';
import { Axis } from '@vx/axis';
import { format } from 'd3-format';
import { scaleLinear } from 'd3-scale';
import styles from './HeatmapVis.module.css';

type Orientation = 'top' | 'left';

interface Props {
  orientation: Orientation;
  className: string;
  numberPixels: number;
}

function IndexAxis(props: Props): JSX.Element {
  const { orientation, numberPixels, className } = props;
  const [divRef, { width, height }] = useMeasure();
  const isLeftAxis = orientation === 'left';
  const range = [0, isLeftAxis ? height : width];

  return (
    <div ref={divRef} className={className}>
      <svg className={styles.axis} data-orientation={orientation}>
        <Axis
          scale={scaleLinear()
            .domain([-0.5, numberPixels - 0.5])
            .range(range)}
          left={isLeftAxis ? width : 0}
          top={isLeftAxis ? 0 : height}
          orientation={orientation}
          strokeWidth={0}
          tickFormat={format('0')}
          numTicks={Math.min(numberPixels, 5)}
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          tickLabelProps={(value, index) =>
            isLeftAxis
              ? { className: styles.tick, dx: '-0.25em' }
              : { className: styles.tick, dy: '-0.25em' }
          }
        />
      </svg>
    </div>
  );
}

export default IndexAxis;
