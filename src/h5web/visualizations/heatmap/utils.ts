import { rgb } from 'd3-color';
import { scaleLinear } from 'd3-scale';
import { range } from 'lodash-es';
import { D3Interpolator, DataScale, ColorScale } from './store';

export function computeTextureData(
  values: number[],
  colorScale: ColorScale,
  dataScale?: DataScale
): Uint8Array | undefined {
  if (dataScale === undefined) {
    return undefined;
  }

  // Compute RGB color array for each datapoint `[[<r>, <g>, <b>], [<r>, <g>, <b>], ...]`
  const colors = values.map(val => {
    const { r, g, b } = rgb(colorScale(dataScale(val))); // `scale` returns CSS RGB strings
    return [r, g, b];
  });

  return Uint8Array.from(colors.flat());
}

export const adaptedNumTicks = scaleLinear()
  .domain([300, 900])
  .rangeRound([3, 10])
  .clamp(true);

export function generateCSSLinearGradient(
  interpolator: D3Interpolator,
  direction: 'top' | 'bottom' | 'right' | 'left'
): string {
  const gradientColors = range(0, 1.1, 0.1)
    .map(interpolator)
    .reduce((acc, val) => `${acc},${val}`);

  return `linear-gradient(to ${direction}, ${gradientColors})`;
}
