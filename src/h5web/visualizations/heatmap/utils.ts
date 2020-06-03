import { range } from 'lodash-es';
import { scaleSymlog, scaleLinear } from 'd3-scale';
import { D3Interpolator, DataScaleFn } from './models';

export function generateCSSLinearGradient(
  interpolator: D3Interpolator,
  direction: 'top' | 'bottom' | 'right' | 'left'
): string {
  const gradientColors = range(0, 1.1, 0.1)
    .map(interpolator)
    .reduce((acc, val) => `${acc},${val}`);

  return `linear-gradient(to ${direction},${gradientColors})`;
}

export function getDataScaleFn(isLog: boolean): DataScaleFn {
  return isLog ? scaleSymlog : scaleLinear;
}
