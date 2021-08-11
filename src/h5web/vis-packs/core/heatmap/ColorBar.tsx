import { AxisRight, AxisBottom } from '@visx/axis';
import { useMeasure } from '@react-hookz/web';
import { adaptedNumTicks, createAxisScale } from '../utils';
import styles from './ColorBar.module.css';
import { getInterpolator, getLinearGradient } from './utils';
import { formatBound } from '../../../utils';
import type { Domain } from '../models';
import type { ColorMap, VisScaleType } from './models';
import Tick from '../shared/Tick';

interface Props {
  domain: Domain;
  scaleType: VisScaleType;
  colorMap: ColorMap;
  horizontal?: boolean;
  withBounds?: boolean;
  invertColorMap: boolean;
}

function ColorBar(props: Props) {
  const {
    domain,
    scaleType,
    colorMap,
    horizontal,
    withBounds,
    invertColorMap,
  } = props;

  const [barSize, barRef] = useMeasure<HTMLDivElement>();
  const gradientLength = barSize
    ? horizontal
      ? barSize.width
      : barSize.height
    : 0;

  const Axis = horizontal ? AxisBottom : AxisRight;
  const isEmptyDomain = domain[0] === domain[1];

  const axisScale = createAxisScale(scaleType, {
    domain,
    range: horizontal
      ? [0, Math.round(gradientLength + 0.5)] // fix sub-pixel misalignment
      : [Math.round(gradientLength + 0.5), 0],
  });

  return (
    <div className={styles.colorBar} data-horizontal={horizontal || undefined}>
      {withBounds && (
        <>
          <p className={styles.minBound}>
            {isEmptyDomain ? '−∞' : formatBound(domain[0])}
          </p>
          <p className={styles.maxBound}>
            {isEmptyDomain ? '+∞' : formatBound(domain[1])}
          </p>
        </>
      )}
      <div ref={barRef} className={styles.gradientBar}>
        <div
          className={styles.gradient}
          data-keep-colors
          style={{
            backgroundImage: getLinearGradient(
              getInterpolator(colorMap, invertColorMap),
              horizontal ? 'right' : 'top',
              domain[0] === domain[1]
            ),
          }}
        />
      </div>
      {gradientLength > 0 && (
        <svg
          className={styles.axis}
          width={horizontal ? '100%' : '2.5em'}
          height={horizontal ? '2.5em' : '100%'}
        >
          <Axis
            scale={axisScale}
            hideAxisLine
            numTicks={adaptedNumTicks(gradientLength)}
            tickClassName={styles.tick}
            tickComponent={Tick}
            tickFormat={axisScale.tickFormat(
              adaptedNumTicks(gradientLength),
              '.3~g'
            )}
          />
        </svg>
      )}
    </div>
  );
}

export type { Props as ColorBarProps };
export default ColorBar;
