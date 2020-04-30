import { scaleLinear, scaleSymlog } from 'd3-scale';
import { range } from 'lodash-es';
import { D3Interpolator, Domain, DataScale } from './models';

export const adaptedNumTicks = scaleLinear()
  .domain([300, 900])
  .rangeRound([3, 10])
  .clamp(true);

export function getDataScale(domain: Domain, isLog: boolean): DataScale {
  const scale = (isLog ? scaleSymlog : scaleLinear)();
  scale.domain(domain);
  return scale;
}

export function generateCSSLinearGradient(
  interpolator: D3Interpolator,
  direction: 'top' | 'bottom' | 'right' | 'left'
): string {
  const gradientColors = range(0, 1.1, 0.1)
    .map(interpolator)
    .reduce((acc, val) => `${acc},${val}`);

  return `linear-gradient(to ${direction}, ${gradientColors})`;
}
