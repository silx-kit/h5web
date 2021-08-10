import { useMeasure } from '@react-hookz/web';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleLinear } from '@visx/scale';
import { useDomain } from '../../../vis-packs/core/hooks';
import type { HistogramData } from '../../../vis-packs/core/models';
import Tick from '../../../vis-packs/core/shared/Tick';
import { DEFAULT_DOMAIN } from '../../../vis-packs/core/utils';
import styles from './Histogram.module.css';

function Histogram(props: HistogramData) {
  const { data, bins } = props;

  const domain = useDomain(data);

  const [size, ref] = useMeasure<HTMLDivElement>();

  if (!size) {
    return <div ref={ref} className={styles.container} />;
  }

  const { width, height } = size;

  const xScale = scaleLinear({
    domain: [bins[0], bins[bins.length - 1]],
    range: [0, width],
  });
  const yScale = scaleLinear({
    domain: domain ? [0, domain[1]] : DEFAULT_DOMAIN,
    range: [0, height],
  });

  return (
    <div ref={ref} className={styles.container}>
      <svg width="100%" height="100%" className={styles.histogram}>
        {data.map((d, i) => (
          <rect
            className={styles.bar}
            key={i} // eslint-disable-line react/no-array-index-key
            x={xScale(bins[i])}
            y={height - yScale(d)}
            width={xScale(bins[i + 1]) - xScale(bins[i]) + 0.5} // +0.5 removes the small gap between bars
            height={yScale(d)}
          />
        ))}

        <AxisBottom top={height} scale={xScale} tickComponent={Tick} />
        <AxisLeft scale={yScale.range([height, 0])} tickComponent={Tick} />
      </svg>
    </div>
  );
}

export default Histogram;
