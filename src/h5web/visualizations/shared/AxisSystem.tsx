import React, { useState } from 'react';
import { useThree, useFrame, Dom } from 'react-three-fiber';
import { scaleLinear, ScaleLinear } from 'd3-scale';
import { AxisLeft, AxisBottom } from '@vx/axis';
import { format } from 'd3-format';
import { TickRendererProps } from '@vx/axis/lib/types';
import { Grid } from '@vx/grid';
import styles from './AxisSystem.module.css';
import { AxisOffsets, AxisDomains } from './models';
import { adaptedNumTicks } from './utils';

interface Props {
  axisDomains: AxisDomains;
  axisOffsets: AxisOffsets;
  showGrid?: boolean;
}

interface AxisScales {
  x: ScaleLinear<number, number>;
  y: ScaleLinear<number, number>;
}

function AxisSystem(props: Props): JSX.Element {
  const { axisDomains, axisOffsets, showGrid } = props;

  const { camera, size } = useThree();
  const { width, height } = size;

  const [axisScales, setAxisScales] = useState<AxisScales>({
    x: scaleLinear(),
    y: scaleLinear(),
  });

  // Axis bounds in R3F camera coordinates
  const axisCoords = {
    x: [-width / 2, width / 2],
    y: [-height / 2, height / 2],
  };

  // Scales R3F camera coordinates to data bounds
  const cameraToBounds = {
    x: scaleLinear()
      .domain(axisCoords.x)
      .range(axisDomains.bottom),
    y: scaleLinear()
      .domain(axisCoords.y)
      .range(axisDomains.left),
  };

  useFrame(() => {
    const { position, zoom } = camera;
    const xBounds = axisCoords.x.map(bound =>
      cameraToBounds.x(bound / zoom + position.x)
    );
    const yBounds = axisCoords.y.map(bound =>
      cameraToBounds.y(bound / zoom + position.y)
    );

    setAxisScales({
      x: scaleLinear()
        .domain(xBounds)
        .range([0, width]),
      y: scaleLinear()
        .domain(yBounds)
        .range([height, 0]),
    });
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
        width: width + axisOffsets.left,
        height: height + axisOffsets.bottom,
        left: -axisOffsets.left,
        gridTemplateColumns: `${axisOffsets.left}px 1fr`,
        gridTemplateRows: `1fr ${axisOffsets.bottom}px`,
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
