import React, { useState } from 'react';
import { useThree, useFrame, Dom } from 'react-three-fiber';
import { scaleLinear } from 'd3-scale';
import Axis from './Axis';
import styles from './AxisGrid.module.css';
import { Domain, AxisOffsets, AxisDomains } from './models';

interface Props {
  axisDomains: AxisDomains;
  axisOffsets: AxisOffsets;
}

function AxisGrid(props: Props): JSX.Element {
  const { axisDomains, axisOffsets } = props;

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

  return (
    <Dom
      className={styles.axisGrid}
      style={{
        // Take over space reserved for axis by `useHeatmapStyles` hook
        width: width + axisOffsets.left,
        height: height + axisOffsets.bottom,
        left: -axisOffsets.left,
        gridTemplateColumns: `${axisOffsets.left}px 1fr`,
        gridTemplateRows: `1fr ${axisOffsets.bottom}px`,
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
