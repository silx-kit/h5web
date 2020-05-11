import React, { useState } from 'react';
import { useThree, useFrame, Dom } from 'react-three-fiber';
import { AxisLeft, AxisBottom } from '@vx/axis';
import { format } from 'd3-format';
import { TickRendererProps } from '@vx/axis/lib/types';
import { Grid } from '@vx/grid';
import { scaleLinear } from 'd3-scale';
import styles from './AxisSystem.module.css';
import { AxisOffsets, AxisDomains } from './models';
import { adaptedNumTicks, sceneToAxisScales } from './utils';

interface Props {
  axisDomains: AxisDomains;
  axisOffsets: AxisOffsets;
  showGrid?: boolean;
}

function AxisSystem(props: Props): JSX.Element {
  const { axisDomains, axisOffsets, showGrid } = props;

  const { camera, size } = useThree();
  const { position, zoom } = camera;
  const { width, height } = size;

  const [domains, setDomains] = useState<AxisDomains>({
    left: axisDomains.left,
    bottom: axisDomains.bottom,
  });

  const sceneToAxis = sceneToAxisScales(size, axisDomains);

  const axisScales = {
    x: scaleLinear()
      .domain(domains.bottom)
      .range([0, width]),
    y: scaleLinear()
      .domain(domains.left)
      .range([height, 0]),
  };

  useFrame(() => {
    setDomains({
      bottom: [
        sceneToAxis.x(-width / (2 * zoom) + position.x),
        sceneToAxis.x(width / (2 * zoom) + position.x),
      ],
      left: [
        sceneToAxis.y(-height / (2 * zoom) + position.y),
        sceneToAxis.y(height / (2 * zoom) + position.y),
      ],
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
