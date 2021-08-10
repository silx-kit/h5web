import type { Domain } from '../../../vis-packs/core/models';
import styles from './Histogram.module.css';

const ARROW_SIZE = 10;

interface Props {
  positions: Domain;
  height: number;
}

function HistogramIndicators(props: Props) {
  const { positions, height } = props;
  const [xMin, xMax] = positions;

  return (
    <g className={styles.indicators}>
      <line x1={xMin} x2={xMin} y1={0} y2={height} />
      <polygon
        points={`${xMin},0 ${xMin},${ARROW_SIZE} ${xMin + ARROW_SIZE},${
          ARROW_SIZE / 2
        }`}
      />
      <line x1={xMax} x2={xMax} y1={0} y2={height} />
      <polygon
        points={`${xMax},0 ${xMax},${ARROW_SIZE} ${xMax - ARROW_SIZE},${
          ARROW_SIZE / 2
        }`}
      />
    </g>
  );
}

export default HistogramIndicators;
