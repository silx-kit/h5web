import React, { useState, useContext } from 'react';
import { useThree, useFrame, Dom } from 'react-three-fiber';
import { AxisLeft, AxisBottom } from '@vx/axis';
import { format } from 'd3-format';
import { TickRendererProps } from '@vx/axis/lib/types';
import { Grid } from '@vx/grid';
import styles from './AxisSystem.module.css';
import { AxisOffsets, Domain } from './models';
import { adaptedNumTicks, useAbscissaScale, useOrdinateScale } from './utils';
import { AxisSystemContext } from './AxisSystemProvider';

interface Props {
  axisOffsets: AxisOffsets;
}

function AxisSystem(props: Props): JSX.Element {
  const { axisOffsets } = props;

  const { camera, size } = useThree();
  const { width, height } = size;

  const { abscissaConfig, ordinateConfig } = useContext(AxisSystemContext);
  const abscissa = useAbscissaScale();
  const ordinate = useOrdinateScale();

  // axisDomains are the complete domains. visibleDomains change with the camera
  const [visibleDomains, setVisibleDomains] = useState<[Domain, Domain]>([
    abscissa.domain,
    ordinate.domain,
  ]);

  useFrame(() => {
    const { position, zoom } = camera;

    // Finds the visible domains from the camera FOV (zoom and position).
    setVisibleDomains([
      [
        abscissa.scale.invert(-width / (2 * zoom) + position.x),
        abscissa.scale.invert(width / (2 * zoom) + position.x),
      ],
      [
        ordinate.scale.invert(-height / (2 * zoom) + position.y),
        ordinate.scale.invert(height / (2 * zoom) + position.y),
      ],
    ]);
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

  // Restrain axis scales to visible domains
  const xAxisScale = abscissa.scaleFn();
  xAxisScale.domain(visibleDomains[0]);
  xAxisScale.range([0, width]);

  const yAxisScale = ordinate.scaleFn();
  yAxisScale.domain(visibleDomains[1]);
  yAxisScale.range([height, 0]);

  const abscissaTicksNumber = adaptedNumTicks(width);
  const ordinateTicksNumber = adaptedNumTicks(height);

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
              scale={xAxisScale}
              numTicks={abscissaTicksNumber}
              {...sharedAxisProps}
            />
          </svg>
        </div>
        <div className={styles.leftAxisCell}>
          <svg className={styles.axis} data-orientation="left">
            <AxisLeft
              scale={yAxisScale}
              left={axisOffsets.left}
              numTicks={ordinateTicksNumber}
              {...sharedAxisProps}
            />
          </svg>
        </div>
        {abscissaConfig.showGrid && ordinateConfig.showGrid && (
          <div className={styles.axisGridCell}>
            <svg width={width} height={height}>
              <Grid
                xScale={xAxisScale}
                yScale={yAxisScale}
                width={width}
                height={height}
                numTicksColumns={abscissaTicksNumber}
                numTicksRows={ordinateTicksNumber}
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
