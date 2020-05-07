import React, { useState } from 'react';
import { useThree, useFrame, Dom } from 'react-three-fiber';
import { scaleLinear } from 'd3-scale';
import { AxisLeft, AxisBottom } from '@vx/axis';
import { format } from 'd3-format';
import { TickRendererProps } from '@vx/axis/lib/types';
import { Grid } from '@vx/grid';
import styles from './AxisSystem.module.css';
import { Domain, AxisOffsets, AxisDomains } from './models';
import { adaptedNumTicks } from './utils';

interface Props {
  axisDomains: AxisDomains;
  axisOffsets: AxisOffsets;
  showGrid?: boolean;
}

function AxisSystem(props: Props): JSX.Element {
  const { axisDomains, axisOffsets, showGrid } = props;

  const { camera, size } = useThree();
  const { width, height } = size;

  const [domains, setDomains] = useState<AxisDomains>(axisDomains);

  // Axis bounds in R3F camera coordinates
  const leftAxisBounds = [-height / 2, height / 2];
  const bottomAxisBounds = [-width / 2, width / 2];

  // Scales R3F camera coordinates to axis bounds
  const leftAxisScale = scaleLinear()
    .domain(leftAxisBounds)
    .range(axisDomains.left);
  const bottomAxisScale = scaleLinear()
    .domain(bottomAxisBounds)
    .range(axisDomains.bottom);

  useFrame(() => {
    const { position, zoom } = camera;

    // Scale bounds according to zoom and shift by camera position
    setDomains({
      left: leftAxisBounds.map(bound =>
        leftAxisScale(bound / zoom + position.y)
      ) as Domain,
      bottom: bottomAxisBounds.map(bound =>
        bottomAxisScale(bound / zoom + position.x)
      ) as Domain,
    });
  });

  const axisProps = {
    tickStroke: '#8cdfc7', // var(--secondary)
    hideAxisLine: true,
    tickFormat: format('0'),
    tickClassName: styles.tick,
    tickComponent: ({ formattedValue, ...tickProps }: TickRendererProps) => (
      <text {...tickProps}>{formattedValue}</text>
    ),
  };

  const yScale = scaleLinear()
    .domain(domains.left)
    .range([height, 0]);
  const yTicksNum = adaptedNumTicks(height);

  const xScale = scaleLinear()
    .domain(domains.bottom)
    .range([0, width]);
  const xTicksNum = adaptedNumTicks(width);

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
            <AxisBottom scale={xScale} numTicks={xTicksNum} {...axisProps} />
          </svg>
        </div>
        <div className={styles.leftAxisCell}>
          <svg className={styles.axis} data-orientation="left">
            <AxisLeft
              scale={yScale}
              left={axisOffsets.left}
              numTicks={yTicksNum}
              {...axisProps}
            />
          </svg>
        </div>
        {showGrid && (
          <div className={styles.axisGridCell}>
            <svg width={width} height={height}>
              <Grid
                xScale={xScale}
                yScale={yScale}
                width={width}
                height={height}
                numTicksColumns={xTicksNum}
                numTicksRows={yTicksNum}
                stroke={axisProps.tickStroke}
                strokeOpacity={0.5}
              />
            </svg>
          </div>
        )}
      </>
    </Dom>
  );
}

export default AxisSystem;
