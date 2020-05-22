import React, { useState, useContext } from 'react';
import { useThree, useFrame, Dom } from 'react-three-fiber';
import { AxisLeft, AxisBottom } from '@vx/axis';
import { format } from 'd3-format';
import { TickRendererProps } from '@vx/axis/lib/types';
import { GridColumns, GridRows } from '@vx/grid';
import styles from './AxisSystem.module.css';
import { AxisOffsets, Domain } from './models';
import { useAbscissaScale, useOrdinateScale, getTicksProp } from './utils';
import { AxisSystemContext } from './AxisSystemProvider';

const SHARED_PROPS = {
  tickStroke: 'grey',
  hideAxisLine: true,
  tickFormat: format('0'),
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

  // Restrain ticks scales to visible domains
  const xTicksScale = abscissa.scaleFn();
  xTicksScale.domain(visibleDomains[0]);
  xTicksScale.range([0, width]);

  const yTicksScale = ordinate.scaleFn();
  yTicksScale.domain(visibleDomains[1]);
  yTicksScale.range([height, 0]);

  const xTicksProp = getTicksProp(abscissaConfig, visibleDomains[0], width);
  const yTicksProp = getTicksProp(ordinateConfig, visibleDomains[1], height);

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
            <AxisBottom scale={xTicksScale} {...xTicksProp} {...SHARED_PROPS} />
          </svg>
        </div>
        <div className={styles.leftAxisCell}>
          <svg className={styles.axis} data-orientation="left">
            <AxisLeft
              scale={yTicksScale}
              left={axisOffsets.left}
              {...yTicksProp}
              {...SHARED_PROPS}
            />
          </svg>
        </div>
        <div className={styles.axisGridCell}>
          <svg width={width} height={height}>
            {abscissaConfig.showGrid && (
              <GridColumns
                scale={xTicksScale}
                {...xTicksProp}
                width={width}
                height={height}
                stroke={SHARED_PROPS.tickStroke}
                strokeOpacity={0.33}
              />
            )}
            {ordinateConfig.showGrid && (
              <GridRows
                scale={yTicksScale}
                {...yTicksProp}
                width={width}
                height={height}
                stroke={SHARED_PROPS.tickStroke}
                strokeOpacity={0.33}
              />
            )}
          </svg>
        </div>
      </>
    </Dom>
  );
}

export default AxisSystem;
