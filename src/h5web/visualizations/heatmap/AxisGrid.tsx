import React, { useState } from 'react';
import { Dom, useThree, useFrame } from 'react-three-fiber';
import { scaleLinear } from 'd3-scale';
import IndexAxis from './IndexAxis';
import styles from './HeatmapVis.module.css';
import { Domain } from './store';

interface AxisDomains {
  left: Domain;
  bottom: Domain;
}

interface Props {
  dims: [number, number];
  axisOffsets: [number, number];
}

function AxisGrid(props: Props): JSX.Element {
  const { dims, axisOffsets } = props;
  const [rows, cols] = dims;
  const [leftAxisWidth, bottomAxisHeight] = axisOffsets;

  const { camera, size } = useThree();
  const { width, height } = size;

  const [domains, setDomains] = useState<AxisDomains>({
    left: [0, rows],
    bottom: [0, cols],
  });

  // Axis bounds in R3F camera coordinates
  const leftAxisBounds: Domain = [-height / 2 + bottomAxisHeight, height / 2];
  const bottomAxisBounds: Domain = [-width / 2 + leftAxisWidth, width / 2];

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
    <Dom>
      <div className={styles.axisGrid} style={{ width, height }}>
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
      </div>
    </Dom>
  );
}

export default AxisGrid;
