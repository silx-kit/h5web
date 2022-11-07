import type { Domain } from '@h5web/shared';
import { Drag } from '@visx/drag';

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

  return (
    <g className={styles.markers}>
      <Drag
        height={height}
        width={width}
        x={xMin}
        onDragEnd={({ dx }) => onChange?.([xMin + dx, xMax])}
        restrict={{ xMin: 0, xMax }}
      >
        {(dragState) => <Marker x={xMin} dragState={onChange && dragState} />}
      </Drag>
      <Drag
        height={height}
        width={width}
        x={xMax}
        onDragEnd={({ dx }) => onChange?.([xMin, xMax + dx])}
        restrict={{ xMin, xMax: width }}
      >
        {(dragState) => (
          <Marker x={xMax} flipArrow dragState={onChange && dragState} />
        )}
      </Drag>
    </g>
  );
}

export default Markers;
