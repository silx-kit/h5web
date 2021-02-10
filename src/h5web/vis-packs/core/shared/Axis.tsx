import type { ElementType, ReactElement } from 'react';
import { AxisLeft, AxisBottom, TickRendererProps } from '@visx/axis';
import { GridColumns, GridRows } from '@visx/grid';
import styles from './AxisSystem.module.css';
import { Domain, Size, ScaleType, AxisConfig } from '../models';
import {
  adaptedNumTicks,
  getIntegerTicks,
  getTickFormatter,
  createAxisScale,
} from '../utils';

const AXIS_PROPS = {
  hideAxisLine: true,
  tickClassName: styles.tick,
  labelClassName: styles.label,
  labelProps: {}, // To avoid any styling props on the parent svg
  tickComponent: ({ formattedValue, ...tickProps }: TickRendererProps) => (
    <text {...tickProps}>{formattedValue}</text>
  ),
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
  flipAxis?: boolean;
}

function Axis(props: Props): ReactElement {
  const { type, config, domain, canvasSize, flipAxis } = props;

  const { width, height } = canvasSize;
  const axisLength = type === 'abscissa' ? width : height;

  const { scaleType = ScaleType.Linear, isIndexAxis, showGrid, label } = config;
  // Restrain ticks scales to visible domains
  const scale = createAxisScale({
    domain,
    range: flipAxis ? [axisLength, 0] : [0, axisLength],
    type: scaleType,
  });

  const [AxisComponent, GridComponent] = COMPONENTS[type];

  const numTicks = adaptedNumTicks(axisLength);
  const ticksProp = isIndexAxis
    ? { tickValues: getIntegerTicks(domain, numTicks) }
    : { numTicks };

  return (
    <>
      <svg className={styles.axis} data-type={type}>
        <AxisComponent
          scale={scale}
          tickFormat={getTickFormatter(domain, axisLength, scaleType)}
          label={label}
          labelOffset={type === 'abscissa' ? 22 : 42}
          {...ticksProp}
          {...AXIS_PROPS}
        />
      </svg>
      {showGrid && (
        <svg className={styles.grid}>
          <GridComponent
            scale={scale}
            width={width}
            height={height}
            {...ticksProp}
          />
        </svg>
      )}
    </>
  );
}

export default Axis;
