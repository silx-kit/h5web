import { type Domain, ScaleType } from '@h5web/shared/vis-models';
import { AxisBottom, AxisLeft, type SharedAxisProps } from '@visx/axis';
import { GridColumns, GridRows } from '@visx/grid';
import { type ElementType } from 'react';

import { type AxisConfig, type AxisScale, type Size } from '../models';
import {
  adaptedNumTicks,
  createScale,
  getIntegerTicks,
  getTickFormatter,
} from '../utils';
import styles from './AxisSystem.module.css';
import Tick from './Tick';

const AXIS_PROPS: Partial<SharedAxisProps<AxisScale>> = {
  labelClassName: styles.label,
  labelProps: { fontSize: 'inherit' },
  tickClassName: styles.tick,
  tickComponent: Tick,
};

const COMPONENTS: Record<string, [ElementType, ElementType]> = {
  abscissa: [AxisBottom, GridColumns],
  ordinate: [AxisLeft, GridRows],
};

interface Props {
  type: 'abscissa' | 'ordinate';
  config: AxisConfig;
  domain: Domain;
  canvasSize: Size;
  offset: number;
  flipAxis?: boolean;
  showAxis?: boolean;
}

function Axis(props: Props) {
  const { type, config, domain, canvasSize, offset, flipAxis, showAxis } =
    props;

  const { width, height } = canvasSize;
  const isAbscissa = type === 'abscissa';
  const axisLength = isAbscissa ? width : height;

  const {
    scaleType = ScaleType.Linear,
    isIndexAxis,
    showGrid,
    label,
    nice = false,
    formatTick,
  } = config;
  // Restrain ticks scales to visible domains
  const scale = createScale(scaleType, {
    domain,
    range: flipAxis ? [axisLength, 0] : [0, axisLength],
    nice,
  });

  const [AxisComponent, GridComponent] = COMPONENTS[type];

  const numTicks = adaptedNumTicks(axisLength);
  const ticksProp = isIndexAxis
    ? { tickValues: getIntegerTicks(domain, numTicks) }
    : { numTicks };

  return (
    <>
      {showAxis && (
        <svg
          className={styles.axis}
          data-type={type}
          style={
            isAbscissa ? { width, height: offset } : { width: offset, height }
          }
        >
          <AxisComponent
            scale={scale}
            tickFormat={
              formatTick || getTickFormatter(domain, axisLength, scaleType)
            }
            label={label}
            labelOffset={offset - (isAbscissa ? 32 : 36)}
            hideAxisLine={showGrid}
            {...ticksProp}
            {...AXIS_PROPS}
          />
        </svg>
      )}
      {showGrid && (
        <svg className={styles.grid} {...canvasSize}>
          <GridComponent scale={scale} {...canvasSize} {...ticksProp} />
        </svg>
      )}
    </>
  );
}

export default Axis;
