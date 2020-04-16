import { extent } from 'd3-array';
import { rgb } from 'd3-color';
import {
  scaleSequential,
  ScaleLinear,
  ScaleSymLog,
  scaleLinear,
  scaleSymlog,
} from 'd3-scale';
import { range } from 'lodash-es';
import { D3Interpolator } from './store';

export type ColorScale =
  | ScaleLinear<number, number>
  | ScaleSymLog<number, number>;

export function computeTextureData(
  values: number[],
  interpolator: D3Interpolator,
  colorScale?: ColorScale
): Uint8Array | undefined {
  if (colorScale === undefined) {
    return undefined;
  }

  // Map colors to the output of colorScale
  const scale = scaleSequential(interpolator).domain(
    colorScale.range() as [number, number]
  );
  // Compute RGB color array for each datapoint `[[<r>, <g>, <b>], [<r>, <g>, <b>], ...]`
  const colors = values.map(val => {
    const { r, g, b } = rgb(scale(colorScale(val))); // `scale` returns CSS RGB strings
    return [r, g, b];
  });

  return Uint8Array.from(colors.flat());
}

export function findDomain(values: number[]): [number, number] | undefined {
  const [min, max] = extent(values);

  if (min === undefined || max === undefined) {
    return undefined;
  }
  return [min, max];
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

export function getColorScale(
  domain: [number, number] | undefined,
  hasLogScale: boolean
): ColorScale | undefined {
  if (domain === undefined) {
    return undefined;
  }

  const scaleFunction = hasLogScale ? scaleSymlog : scaleLinear;
  return scaleFunction().domain(domain) as ColorScale;
}
