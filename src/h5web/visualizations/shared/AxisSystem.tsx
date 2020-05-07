import React, { useState } from 'react';
import { useThree, useFrame, Dom } from 'react-three-fiber';
import { scaleLinear } from 'd3-scale';
import { AxisLeft, AxisBottom } from '@vx/axis';
import { format } from 'd3-format';
import { TickRendererProps } from '@vx/axis/lib/types';
import { Grid } from '@vx/grid';
import styles from './AxisSystem.module.css';
import { Domain, AxisOffsets, AxisDomains, TwoDimScale } from './models';
import { adaptedNumTicks, computeAxisScales } from './utils';

interface Props {
  axisDomains: AxisDomains;
  axisOffsets: AxisOffsets;
  showGrid?: boolean;
}

function AxisSystem(props: Props): JSX.Element {
  const { axisDomains, axisOffsets, showGrid } = props;

  const { camera, size } = useThree();
  const { width, height } = size;

  // Axis bounds in R3F camera coordinates
  const axisCoords = {
    x: [-width / 2, width / 2] as Domain,
    y: [-height / 2, height / 2] as Domain,
  };

  // Scales R3F camera coordinates to data bounds
  const cameraToBounds = {
    x: scaleLinear()
      .domain(axisCoords.x)
      .range(axisDomains.x),
    y: scaleLinear()
      .domain(axisCoords.y)
      .range(axisDomains.y),
  };

  const [axisScales, setAxisScales] = useState<TwoDimScale>(
    computeAxisScales(camera, size, cameraToBounds, axisCoords)
  );

  useFrame(() => {
    setAxisScales(computeAxisScales(camera, size, cameraToBounds, axisCoords));
  });

  const sharedAxisProps = {
    tickStroke: 'grey',
    hideAxisLine: true,
    tickFormat: format('0'),
    tickClassName: styles.tick,
    tickComponent: ({ formattedValue, ...tickProps }: TickRendererProps) => (
      <text {...tickProps}>{formattedValue}</text>
    ),
  };

  const adaptedTicksNum = {
    x: adaptedNumTicks(width),
    y: adaptedNumTicks(height),
  };

  return (
    <Dom
      className={styles.axisSystem}
      style={{
        // Take over space reserved for axis by VisCanvas
        width: width + axisOffsets.left + axisOffsets.right,
        height: height + axisOffsets.bottom + axisOffsets.top,
        top: -axisOffsets.top,
        left: -axisOffsets.left,
        gridTemplateColumns: `${axisOffsets.left}px 1fr ${axisOffsets.right}px`,
        gridTemplateRows: `${axisOffsets.top}px 1fr ${axisOffsets.bottom}px`,
      }}
    >
      <>
        <div className={styles.bottomAxisCell}>
          <svg className={styles.axis} data-orientation="bottom">
            <AxisBottom
              scale={axisScales.x}
              numTicks={adaptedTicksNum.x}
              {...sharedAxisProps}
            />
          </svg>
        </div>
        <div className={styles.leftAxisCell}>
          <svg className={styles.axis} data-orientation="left">
            <AxisLeft
              scale={axisScales.y}
              left={axisOffsets.left}
              numTicks={adaptedTicksNum.y}
              {...sharedAxisProps}
            />
          </svg>
        </div>
        {showGrid && (
          <div className={styles.axisGridCell}>
            <svg width={width} height={height}>
              <Grid
                xScale={axisScales.x}
                yScale={axisScales.y}
                width={width}
                height={height}
                numTicksColumns={adaptedTicksNum.x}
                numTicksRows={adaptedTicksNum.y}
                stroke={sharedAxisProps.tickStroke}
                strokeOpacity={0.33}
              />
            </svg>
          </div>
        )}
      </>
    </Dom>
  );
}

export default AxisSystem;
