import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleLinear } from '@visx/scale';
import { useDomain } from '../../../vis-packs/core/hooks';
import type { Size } from '../../../vis-packs/core/models';
import styles from './DataHistogram.module.css';

interface Props {
  bins: number[];
  data: number[];
  size: Size | undefined;
}

function DataHistogram(props: Props) {
  const { data, bins, size = { width: 0, height: 0 } } = props;
  const { height, width } = size;

  const domain = useDomain(data);

  const xScale = scaleLinear({
    domain: [bins[0], bins[bins.length - 1]],
    range: [0, width],
  });
  const yScale = scaleLinear({
    domain: domain ? [0, domain[1]] : undefined,
    range: [0, height],
  });

  return (
    <div className={styles.container}>
      <svg width={width} height={height} className={styles.svg}>
        {data.map((d, i) => (
          <rect
            className={styles.bar}
            key={i} // eslint-disable-line react/no-array-index-key
            x={xScale(bins[i])}
            y={height - yScale(d)}
            width={xScale(bins[i + 1]) - xScale(bins[i])}
            height={yScale(d)}
          />
        ))}

        <AxisBottom top={height} scale={xScale} />
        <AxisLeft scale={yScale.range([height, 0])} />
      </svg>
    </div>
  );
}

export default DataHistogram;
