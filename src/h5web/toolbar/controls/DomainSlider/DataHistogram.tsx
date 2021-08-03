import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleLinear } from '@visx/scale';
import { useDomain } from '../../../vis-packs/core/hooks';
import type { ScaleType, Size, Domain } from '../../../vis-packs/core/models';
import { H5WEB_SCALES } from '../../../vis-packs/core/scales';
import Tick from '../../../vis-packs/core/shared/Tick';
import { adaptedNumTicks } from '../../../vis-packs/core/utils';
import styles from './DataHistogram.module.css';

interface Props {
  bins: number[];
  data: number[];
  size: Size | undefined;
  scaleType: ScaleType;
  sliderDomain: Domain;
}

function DataHistogram(props: Props) {
  const {
    data,
    bins,
    scaleType,
    sliderDomain,
    size = { width: 0, height: 0 },
  } = props;
  const { height, width } = size;

  const histDomain = useDomain(data);

  const xScale = H5WEB_SCALES[scaleType].createScale({
    domain: sliderDomain,
    range: [0, width],
  });
  const yScale = scaleLinear({
    domain: histDomain ? [0, histDomain[1]] : undefined,
    range: [0, height],
  });

  return (
    <div className={styles.container}>
      <svg width={width} height={height} className={styles.svg}>
        <svg width={width} height={height}>
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
        </svg>

        <AxisBottom
          top={height}
          scale={xScale}
          numTicks={adaptedNumTicks(width)}
          tickClassName={styles.tick}
          tickComponent={Tick}
          tickFormat={xScale.tickFormat(adaptedNumTicks(width), '.3~g')}
        />
        <AxisLeft
          scale={yScale.range([height, 0])}
          numTicks={adaptedNumTicks(height)}
          tickClassName={styles.tick}
          tickComponent={Tick}
          tickFormat={yScale.tickFormat(adaptedNumTicks(height), '.3~g')}
        />
      </svg>
    </div>
  );
}

export default DataHistogram;
