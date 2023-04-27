import type { Domain, ScaleType } from '@h5web/shared';
import { useMeasure } from '@react-hookz/web';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleLinear } from '@visx/scale';
import type { ReactNode } from 'react';

import { useSafeDomain } from '../../../vis/heatmap/hooks';
import { useCombinedDomain, useDomain } from '../../../vis/hooks';
import type { HistogramParams } from '../../../vis/models';
import Tick from '../../../vis/shared/Tick';
import {
  adaptedNumTicks,
  createAxisScale,
  DEFAULT_DOMAIN,
  extendDomain,
} from '../../../vis/utils';
import ColorBar from './ColorBar';
import styles from './Histogram.module.css';
import Markers from './Markers';

const EXTEND_FACTOR = 0.3;

interface Props extends HistogramParams {
  scaleType: ScaleType;
  dataDomain: Domain;
  value: Domain;
  onChange?: (domain: Domain) => void;
}

function Histogram(props: Props) {
  const {
    values,
    bins,
    scaleType,
    value,
    dataDomain,
    onChange,
    showLeftAxis = true,
  } = props;
  const { colorMap, invertColorMap } = props;

  const binDomain = useDomain(bins, scaleType) || DEFAULT_DOMAIN;
  const [safeValue] = useSafeDomain(value, dataDomain, scaleType);
  const xDomain = useCombinedDomain([binDomain, safeValue, dataDomain]);

  const barDomain = useDomain(values);
  const yMax = barDomain ? barDomain[1] : DEFAULT_DOMAIN[1];
  const yMin = colorMap ? -yMax / 10 : 0;

  const [size, ref] = useMeasure<HTMLDivElement>();

  if (!size) {
    return <div ref={ref} className={styles.container} />;
  }

  const { width, height } = size;

  const xScale = createAxisScale(scaleType, {
    domain: xDomain && extendDomain(xDomain, EXTEND_FACTOR, scaleType),
    range: [0, width],
  });
  const yScale = scaleLinear({
    domain: [yMin, yMax],
    range: [0, height],
  });

  const markerPositions = safeValue.map(xScale) as Domain;

  const rects: ReactNode[] = [];
  values.forEach((d, i) =>
    rects.push(
      <rect
        className={styles.bar}
        key={i} // eslint-disable-line react/no-array-index-key
        x={xScale(bins[i])}
        y={height - yScale(d)}
        width={xScale(bins[i + 1]) - xScale(bins[i]) + 0.5} // +0.5 removes the small gap between bars
        height={yScale(d) - yScale(0)}
      />
    )
  );

  return (
    <div ref={ref} className={styles.container}>
      <svg width="100%" height="100%" className={styles.histogram}>
        {rects}
        {colorMap && (
          <ColorBar
            x={markerPositions[0]}
            y={height - yScale(0)}
            width={markerPositions[1] - markerPositions[0]}
            height={yScale(0) - yScale(yMin)}
            colorMap={colorMap}
            invertColorMap={invertColorMap}
          />
        )}
        <Markers
          positions={markerPositions}
          size={size}
          onChange={
            onChange &&
            ((domain) => onChange(domain.map(xScale.invert) as Domain))
          }
        />
        <AxisBottom
          top={height}
          scale={xScale}
          numTicks={adaptedNumTicks(width)}
          tickClassName={styles.tick}
          tickComponent={Tick}
          tickFormat={xScale.tickFormat(adaptedNumTicks(width), '.3~g')}
        />
        {showLeftAxis && (
          <AxisLeft
            scale={yScale.range([height, 0])}
            numTicks={adaptedNumTicks(height)}
            tickClassName={styles.tick}
            tickComponent={Tick}
            tickFormat={yScale.tickFormat(adaptedNumTicks(height), '.3~g')}
          />
        )}
      </svg>
    </div>
  );
}

export type { Props as HistogramProps };
export default Histogram;
