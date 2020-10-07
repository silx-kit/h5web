import React, { useContext } from 'react';
import { useThree } from 'react-three-fiber';
import { AxisLeft, AxisBottom, TickRendererProps } from '@vx/axis';
import { GridColumns, GridRows } from '@vx/grid';
import Html from './Html';
import styles from './AxisSystem.module.css';
import type { AxisOffsets, Domain } from './models';
import { getTicksProp, getAxisScale, getTickFormatter } from './utils';
import { AxisSystemContext } from './AxisSystemProvider';
import { useFrameRendering } from './hooks';

const AXIS_PROPS = {
  tickStroke: 'grey',
  hideAxisLine: true,
  tickClassName: styles.tick,
  tickComponent: ({ formattedValue, ...tickProps }: TickRendererProps) => (
    <text {...tickProps}>{formattedValue}</text>
  ),
};

interface Props {
  axisOffsets: AxisOffsets;
}

function AxisSystem(props: Props): JSX.Element {
  const { axisOffsets } = props;

  const { abscissaInfo, ordinateInfo } = useContext(AxisSystemContext);

  const { camera, size } = useThree();
  const { position, zoom } = camera;
  const { width, height } = size;

  const abscissaScale = getAxisScale(abscissaInfo, width);
  const ordinateScale = getAxisScale(ordinateInfo, height);

  // Find visible domains from camera's zoom and position
  const xVisibleDomain: Domain = [
    abscissaScale.invert(-width / (2 * zoom) + position.x),
    abscissaScale.invert(width / (2 * zoom) + position.x),
  ];

  const yVisibleDomain: Domain = [
    ordinateScale.invert(-height / (2 * zoom) + position.y),
    ordinateScale.invert(height / (2 * zoom) + position.y),
  ];

  // Restrain ticks scales to visible domains
  const xTicksScale = abscissaInfo.scaleFn();
  xTicksScale.domain(xVisibleDomain);
  xTicksScale.range([0, width]);

  const yTicksScale = ordinateInfo.scaleFn();
  yTicksScale.domain(yVisibleDomain);
  yTicksScale.range([height, 0]);

  // Re-render on every R3F frame (i.e. on every change of camera zoom/position)
  useFrameRendering();

  const xTicksProp = getTicksProp(
    xVisibleDomain,
    width,
    abscissaInfo.isIndexAxis
  );
  const yTicksProp = getTicksProp(
    yVisibleDomain,
    height,
    ordinateInfo.isIndexAxis
  );

  const xTickFormat = getTickFormatter(
    xVisibleDomain,
    width,
    abscissaInfo.scaleType
  );
  const yTickFormat = getTickFormatter(
    yVisibleDomain,
    height,
    ordinateInfo.scaleType
  );

  return (
    <Html
      className={styles.axisSystem}
      style={{
        // Take over space reserved for axis by VisCanvas
        top: -axisOffsets.top,
        left: -axisOffsets.left,
        width: width + axisOffsets.left + axisOffsets.right,
        height: height + axisOffsets.bottom + axisOffsets.top,
        gridTemplateColumns: `${axisOffsets.left}px 1fr ${axisOffsets.right}px`,
        gridTemplateRows: `${axisOffsets.top}px 1fr ${axisOffsets.bottom}px`,
      }}
    >
      <div className={styles.bottomAxisCell}>
        <svg className={styles.axis} data-orientation="bottom">
          <AxisBottom
            scale={xTicksScale}
            tickFormat={xTickFormat}
            {...xTicksProp}
            {...AXIS_PROPS}
          />
        </svg>
      </div>
      <div className={styles.leftAxisCell}>
        <svg className={styles.axis} data-orientation="left">
          <AxisLeft
            scale={yTicksScale}
            left={axisOffsets.left}
            tickFormat={yTickFormat}
            {...yTicksProp}
            {...AXIS_PROPS}
          />
        </svg>
      </div>
      <div className={styles.axisGridCell}>
        <svg width={width} height={height}>
          {abscissaInfo.showGrid && (
            <GridColumns
              scale={xTicksScale}
              {...xTicksProp}
              width={width}
              height={height}
              stroke={AXIS_PROPS.tickStroke}
              strokeOpacity={0.33}
            />
          )}
          {ordinateInfo.showGrid && (
            <GridRows
              scale={yTicksScale}
              {...yTicksProp}
              width={width}
              height={height}
              stroke={AXIS_PROPS.tickStroke}
              strokeOpacity={0.33}
            />
          )}
        </svg>
      </div>
    </Html>
  );
}

export default AxisSystem;
