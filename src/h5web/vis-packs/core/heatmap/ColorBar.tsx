import type { ReactElement } from 'react';
import { AxisRight, AxisBottom } from '@visx/axis';
import { useMeasure } from 'react-use';
import { adaptedNumTicks, createAxisScale } from '../utils';
import styles from './ColorBar.module.css';
import { getLinearGradient } from './utils';
import type { ScaleType, Domain } from '../models';
import type { ColorMap } from './models';
import { INTERPOLATORS } from './interpolators';
import { format } from 'd3-format';

const boundFormatter = format('.3~g');

interface Props {
  domain: Domain;
  scaleType: ScaleType;
  colorMap: ColorMap;
  horizontal?: boolean;
  withBounds?: boolean;
}

function ColorBar(props: Props): ReactElement {
  const { domain, scaleType, colorMap, horizontal, withBounds } = props;

  const [gradientRef, gradientBox] = useMeasure();
  const { height: gradientHeight, width: gradientWidth } = gradientBox;
  const gradientLength = horizontal ? gradientWidth : gradientHeight;

  const interpolator = INTERPOLATORS[colorMap];
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
            {isEmptyDomain ? '−∞' : boundFormatter(domain[0])}
          </p>
          <p className={styles.maxBound}>
            {isEmptyDomain ? '+∞' : boundFormatter(domain[1])}
          </p>
        </>
      )}
      <div
        ref={gradientRef as (element: HTMLElement | null) => void} // https://github.com/streamich/react-use/issues/1264
        className={styles.gradient}
        style={{
          backgroundImage: getLinearGradient(
            interpolator,
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
