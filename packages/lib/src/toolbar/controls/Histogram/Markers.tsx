import type { Domain } from '@h5web/shared/vis-models';
import { Drag } from '@visx/drag';
import { useState } from 'react';

import type { Size } from '../../../vis/models';
import styles from './Histogram.module.css';
import Marker from './Marker';

interface Props {
  positions: Domain;
  size: Size;
  onChangeMin?: (val: number) => void;
  onChangeMax?: (val: number) => void;
}

function Markers(props: Props) {
  const { positions, size, onChangeMin, onChangeMax } = props;
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
          onChangeMin?.(xMin + dx);
          setDeltaX(0);
        }}
        restrict={{ xMin: deltaX, xMax: xMax + deltaX }}
      >
        {(dragState) => (
          <Marker x={xMin} dragState={onChangeMin && dragState} />
        )}
      </Drag>
      <Drag
        height={height}
        width={width}
        x={xMax}
        onDragStart={({ x }) => x && setDeltaX(x - xMax)}
        onDragEnd={({ dx }) => {
          onChangeMax?.(xMax + dx);
          setDeltaX(0);
        }}
        restrict={{ xMin: xMin + deltaX, xMax: width + deltaX }}
      >
        {(dragState) => (
          <Marker x={xMax} flipArrow dragState={onChangeMax && dragState} />
        )}
      </Drag>
    </g>
  );
}

export default Markers;
