import type { Domain, ScaleType } from '@h5web/shared';
import { useMeasure } from '@react-hookz/web';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleLinear } from '@visx/scale';

import { useSafeDomain } from '../../../vis/heatmap/hooks';
import { useToArray, useCombinedDomain, useDomain } from '../../../vis/hooks';
import type { HistogramParams } from '../../../vis/models';
import { H5WEB_SCALES } from '../../../vis/scales';
import Tick from '../../../vis/shared/Tick';
import { adaptedNumTicks, DEFAULT_DOMAIN } from '../../../vis/utils';
import styles from './Histogram.module.css';
import HistogramColorBar from './HistogramColorBar';
import HistogramIndicators from './HistogramIndicators';

interface Props extends HistogramParams {
  scaleType: ScaleType;
  dataDomain: Domain;
  sliderDomain: Domain;
}

function Histogram(props: Props) {
  const { values, bins, scaleType, sliderDomain, dataDomain } = props;
  const { colorMap, invertColorMap } = props;

  const binDomain = useDomain(bins, scaleType) || DEFAULT_DOMAIN;
  const [safeSliderDomain] = useSafeDomain(sliderDomain, dataDomain, scaleType);
  const xDomain = useCombinedDomain([binDomain, safeSliderDomain, dataDomain]);

  const barDomain = useDomain(values);
  const yMax = barDomain ? barDomain[1] : DEFAULT_DOMAIN[1];
  const yMin = colorMap ? -yMax / 10 : 0;

  const [size, ref] = useMeasure<HTMLDivElement>();

  const valuesArray = useToArray(values);

  if (!size) {
    return <div ref={ref} className={styles.container} />;
  }

  const { width, height } = size;

  const xScale = H5WEB_SCALES[scaleType].createScale({
    domain: xDomain,
    range: [0, width],
  });
  const yScale = scaleLinear({
    domain: [yMin, yMax],
    range: [0, height],
  });

  const indicatorPositions = safeSliderDomain.map(xScale) as Domain;

  return (
    <div ref={ref} className={styles.container}>
      <svg width="100%" height="100%" className={styles.histogram}>
        {valuesArray.map((d, i) => (
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
