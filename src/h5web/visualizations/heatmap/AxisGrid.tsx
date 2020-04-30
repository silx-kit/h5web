import React, { useState } from 'react';
import { useThree, useFrame, Dom } from 'react-three-fiber';
import { scaleLinear } from 'd3-scale';
import IndexAxis from './IndexAxis';
import styles from './HeatmapVis.module.css';
import { useProps } from './hooks';
import { Domain } from './models';

interface AxisDomains {
  left: Domain;
  bottom: Domain;
}

function AxisGrid(): JSX.Element {
  const { dims, axisOffsets } = useProps();
  const [rows, cols] = dims;
  const [leftAxisWidth, bottomAxisHeight] = axisOffsets;

  const { camera, size } = useThree();
  const { width, height } = size;

  const [domains, setDomains] = useState<AxisDomains>({
    left: [0, rows],
    bottom: [0, cols],
  });

  // Axis bounds in R3F camera coordinates
  const leftAxisBounds = [-height / 2, height / 2];
  const bottomAxisBounds = [-width / 2, width / 2];

  // Scales R3F camera coordinates to axis bounds
  const leftAxisScale = scaleLinear()
    .domain(leftAxisBounds)
    .range([0, rows]);
  const bottomAxisScale = scaleLinear()
    .domain(bottomAxisBounds)
    .range([0, cols]);

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

  return (
    <Dom
      className={styles.axisGrid}
      style={{
        // Take over space reserved for axis by `useHeatmapStyles` hook
        width: width + leftAxisWidth,
        height: height + bottomAxisHeight,
        left: -leftAxisWidth,
        gridTemplateColumns: `${leftAxisWidth}px 1fr`,
        gridTemplateRows: `1fr ${bottomAxisHeight}px`,
      }}
    >
      <>
        <IndexAxis
          className={styles.leftAxisCell}
          orientation="left"
          domain={domains.left}
        />
        <IndexAxis
          className={styles.bottomAxisCell}
          orientation="bottom"
          domain={domains.bottom}
        />
      </>
    </Dom>
  );
}

export default AxisGrid;
