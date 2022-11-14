import type { Domain } from '@h5web/shared';
import { Drag } from '@visx/drag';
import { useState } from 'react';

import type { Size } from '../../../vis/models';
import styles from './Histogram.module.css';
import Marker from './Marker';

interface Props {
  positions: Domain;
  size: Size;
  onChange?: (domain: Domain) => void;
}

function Markers(props: Props) {
  const { positions, size, onChange } = props;
  const { height, width } = size;
  const [xMin, xMax] = positions;

  // Store the mismatch between mouse position and marker to restrict correctly the marker position
  const [deltaX, setDeltaX] = useState(0);

  return (
    <g className={styles.markers}>
      <Drag
        height={height}
        width={width}
        x={xMin}
        onDragStart={({ x }) => x && setDeltaX(x - xMin)}
        onDragEnd={({ dx }) => {
          onChange?.([xMin + dx, xMax]);
          setDeltaX(0);
        }}
        restrict={{ xMin: deltaX, xMax: xMax + deltaX }}
      >
        {(dragState) => <Marker x={xMin} dragState={onChange && dragState} />}
      </Drag>
      <Drag
        height={height}
        width={width}
        x={xMax}
        onDragStart={({ x }) => x && setDeltaX(x - xMax)}
        onDragEnd={({ dx }) => {
          onChange?.([xMin, xMax + dx]);
          setDeltaX(0);
        }}
        restrict={{ xMin: xMin + deltaX, xMax: width + deltaX }}
      >
        {(dragState) => (
          <Marker x={xMax} flipArrow dragState={onChange && dragState} />
        )}
      </Drag>
    </g>
  );
}

export default Markers;
