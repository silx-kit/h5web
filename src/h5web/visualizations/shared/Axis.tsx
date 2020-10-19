import React, { ReactElement, ReactType } from 'react';
import { AxisLeft, AxisBottom, TickRendererProps } from '@vx/axis';
import { GridColumns, GridRows } from '@vx/grid';
import styles from './AxisSystem.module.css';
import type { AxisInfo, AxisScale, Domain, Size } from './models';
import { adaptedNumTicks, getIntegerTicks, getTickFormatter } from './utils';

const AXIS_PROPS = {
  tickStroke: 'grey',
  hideAxisLine: true,
  tickClassName: styles.tick,
  tickComponent: ({ formattedValue, ...tickProps }: TickRendererProps) => (
    <text {...tickProps}>{formattedValue}</text>
  ),
};

const COMPONENTS: Record<string, [ReactType, ReactType]> = {
  abscissa: [AxisBottom, GridColumns],
  ordinate: [AxisLeft, GridRows],
};

interface Props {
  type: 'abscissa' | 'ordinate';
  scale: AxisScale;
  domain: Domain;
  info: AxisInfo;
  canvasSize: Size;
}

function Axis(props: Props): ReactElement {
  const { type, scale, domain, info, canvasSize } = props;
  const { scaleType, showGrid, onlyIntegers } = info;

  const { width, height } = canvasSize;
  const axisLength = type === 'abscissa' ? width : height;

  const [AxisComponent, GridComponent] = COMPONENTS[type];

  const numTicks = adaptedNumTicks(axisLength);
  const ticksProp = onlyIntegers
    ? { tickValues: getIntegerTicks(domain, numTicks) }
    : { numTicks };

  return (
    <>
      <svg className={styles.axis} data-type={type}>
        <AxisComponent
          scale={scale}
          tickFormat={getTickFormatter(domain, axisLength, scaleType)}
          {...ticksProp}
          {...AXIS_PROPS}
        />
      </svg>
      {showGrid && (
        <svg className={styles.grid}>
          <GridComponent
            scale={scale}
            {...ticksProp}
            width={width}
            height={height}
            stroke={AXIS_PROPS.tickStroke}
            strokeOpacity={0.33}
          />
        </svg>
      )}
    </>
  );
}

export default Axis;
