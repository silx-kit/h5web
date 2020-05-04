import React, { useState } from 'react';
import { useThree, useFrame, Dom } from 'react-three-fiber';
import { scaleLinear } from 'd3-scale';
import Axis from './Axis';
import styles from './AxisGrid.module.css';
import { Domain, AxisOffsets } from './models';

interface AxisDomains {
  left: Domain;
  bottom: Domain;
}

interface Props {
  abscissaDomain: Domain;
  ordinateDomain: Domain;
  axisOffsets: AxisOffsets;
}

function AxisGrid(props: Props): JSX.Element {
  const { abscissaDomain, ordinateDomain, axisOffsets } = props;
  const [leftAxisWidth, bottomAxisHeight] = axisOffsets;

  const { camera, size } = useThree();
  const { width, height } = size;

  const [domains, setDomains] = useState<AxisDomains>({
    left: ordinateDomain,
    bottom: abscissaDomain,
  });

  // Axis bounds in R3F camera coordinates
  const leftAxisBounds = [-height / 2, height / 2];
  const bottomAxisBounds = [-width / 2, width / 2];

  // Scales R3F camera coordinates to axis bounds
  const leftAxisScale = scaleLinear()
    .domain(leftAxisBounds)
    .range(ordinateDomain);
  const bottomAxisScale = scaleLinear()
    .domain(bottomAxisBounds)
    .range(abscissaDomain);

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
        <Axis
          className={styles.leftAxisCell}
          orientation="left"
          domain={domains.left}
        />
        <Axis
          className={styles.bottomAxisCell}
          orientation="bottom"
          domain={domains.bottom}
        />
      </>
    </Dom>
  );
}

export default AxisGrid;
