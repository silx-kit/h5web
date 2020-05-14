import React, { useState, useContext } from 'react';
import { useThree, useFrame, Dom } from 'react-three-fiber';
import { AxisLeft, AxisBottom } from '@vx/axis';
import { format } from 'd3-format';
import { TickRendererProps } from '@vx/axis/lib/types';
import { Grid } from '@vx/grid';
import styles from './AxisSystem.module.css';
import { AxisOffsets, AxisDomains } from './models';
import { adaptedNumTicks, useAbscissaScale, useOrdinateScale } from './utils';
import { AxisSystemContext } from './AxisSystemProvider';

interface Props {
  axisOffsets: AxisOffsets;
}

function AxisSystem(props: Props): JSX.Element {
  const { axisOffsets } = props;

  const { camera, size } = useThree();
  const { width, height } = size;

  const { axisDomains, showGrid } = useContext(AxisSystemContext);

  // axisDomains are the complete domains. visibleDomains change with the camera
  const [visibleDomains, setVisibleDomains] = useState<AxisDomains>(
    axisDomains
  );

  // Finds the visible domains from the camera FOV (zoom and position).
  const { abscissaScale, abscissaScaleFn } = useAbscissaScale();
  const { ordinateScale, ordinateScaleFn } = useOrdinateScale();

  useFrame(() => {
    const { position, zoom } = camera;

    setVisibleDomains({
      x: [
        abscissaScale.invert(-width / (2 * zoom) + position.x),
        abscissaScale.invert(width / (2 * zoom) + position.x),
      ],
      y: [
        ordinateScale.invert(-height / (2 * zoom) + position.y),
        ordinateScale.invert(height / (2 * zoom) + position.y),
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

  // Restrain axis scales to visible domains
  const xAxisScale = abscissaScaleFn();
  xAxisScale.domain(visibleDomains.x);
  xAxisScale.range([0, width]);

  const yAxisScale = ordinateScaleFn();
  yAxisScale.domain(visibleDomains.y);
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
        {showGrid && (
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
