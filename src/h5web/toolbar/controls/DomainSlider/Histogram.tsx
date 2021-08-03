import { useMeasure } from '@react-hookz/web';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleLinear } from '@visx/scale';
import { useCombinedDomain, useDomain } from '../../../vis-packs/core/hooks';
import type {
  Domain,
  HistogramParams,
  ScaleType,
} from '../../../vis-packs/core/models';
import { H5WEB_SCALES } from '../../../vis-packs/core/scales';
import Tick from '../../../vis-packs/core/shared/Tick';
import { adaptedNumTicks, DEFAULT_DOMAIN } from '../../../vis-packs/core/utils';
import HistogramColorBar from './HistogramColorBar';
import HistogramIndicators from './HistogramIndicators';
import styles from './Histogram.module.css';

interface Props extends HistogramParams {
  scaleType: ScaleType;
  dataDomain: Domain;
  sliderDomain: Domain;
}

function Histogram(props: Props) {
  const { values, bins, scaleType, sliderDomain, dataDomain } = props;
  const { colorMap, invertColorMap } = props;

  const binDomain = useCombinedDomain([sliderDomain, dataDomain]);
  const barDomain = useDomain(values);
  const yMax = barDomain ? barDomain[1] : DEFAULT_DOMAIN[1];
  const yMin = colorMap ? -yMax / 10 : 0;

  const [size, ref] = useMeasure<HTMLDivElement>();

  if (!size) {
    return <div ref={ref} className={styles.container} />;
  }

  const { width, height } = size;

  const xScale = H5WEB_SCALES[scaleType].createScale({
    domain: binDomain,
    range: [0, width],
  });
  const yScale = scaleLinear({
    domain: [yMin, yMax],
    range: [0, height],
  });

  const indicatorPositions = sliderDomain.map(xScale) as Domain;

  return (
    <div ref={ref} className={styles.container}>
      <svg width="100%" height="100%" className={styles.histogram}>
        {values.map((d, i) => (
          <rect
            className={styles.bar}
            key={i} // eslint-disable-line react/no-array-index-key
            x={xScale(bins[i])}
            y={height - yScale(d)}
            width={xScale(bins[i + 1]) - xScale(bins[i]) + 0.5} // +0.5 removes the small gap between bars
            height={yScale(d) - yScale(0)}
          />
        ))}
        {colorMap && (
          <HistogramColorBar
            x={indicatorPositions[0]}
            y={height - yScale(0)}
            width={indicatorPositions[1] - indicatorPositions[0]}
            height={yScale(0) - yScale(yMin)}
            colorMap={colorMap}
            invertColorMap={invertColorMap}
          />
        )}
        <HistogramIndicators positions={indicatorPositions} height={height} />

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

export default Histogram;
