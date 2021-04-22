import { AxisRight, AxisBottom } from '@visx/axis';
import { useMeasure } from 'react-use';
import { adaptedNumTicks, createAxisScale } from '../utils';
import styles from './ColorBar.module.css';
import { getInterpolator, getLinearGradient } from './utils';
import type { ScaleType, Domain } from '../models';
import type { ColorMap } from './models';
import { formatValue } from '../../../utils';
import Tick from '../shared/Tick';

interface Props {
  domain: Domain;
  scaleType: ScaleType;
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

  const [gradientRef, gradientBox] = useMeasure();
  const { height: gradientHeight, width: gradientWidth } = gradientBox;
  const gradientLength = horizontal ? gradientWidth : gradientHeight;

  const Axis = horizontal ? AxisBottom : AxisRight;
  const isEmptyDomain = domain[0] === domain[1];

  const axisScale = createAxisScale({
    domain,
    range: horizontal ? [0, gradientWidth] : [gradientHeight, 0],
    type: scaleType,
  });

  return (
    <div className={styles.colorBar} data-horizontal={horizontal || undefined}>
      {withBounds && (
        <>
          <p className={styles.minBound}>
            {isEmptyDomain ? '−∞' : formatValue(domain[0])}
          </p>
          <p className={styles.maxBound}>
            {isEmptyDomain ? '+∞' : formatValue(domain[1])}
          </p>
        </>
      )}
      <div
        ref={gradientRef as (element: HTMLElement | null) => void} // https://github.com/streamich/react-use/issues/1264
        className={styles.gradient}
        style={{
          backgroundImage: getLinearGradient(
            getInterpolator(colorMap, invertColorMap),
            horizontal ? 'right' : 'top',
            domain[0] === domain[1]
          ),
        }}
      />
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

export default ColorBar;
