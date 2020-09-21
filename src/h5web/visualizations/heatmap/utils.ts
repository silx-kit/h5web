import { range } from 'lodash-es';
import type { D3Interpolator, Dims } from './models';
import type { DataArray } from '../../dataset-visualizer/models';
import { ScaleType, Domain } from '../shared/models';
import { findDomain } from '../shared/utils';

export function getDims(dataArray: DataArray): Dims {
  const [rows, cols] = dataArray.shape;
  return { rows, cols };
}

export function generateCSSLinearGradient(
  interpolator: D3Interpolator,
  direction: 'top' | 'bottom' | 'right' | 'left'
): string {
  const gradientColors = range(0, 1.1, 0.1)
    .map(interpolator)
    .reduce((acc, val) => `${acc},${val}`);

  return `linear-gradient(to ${direction},${gradientColors})`;
}

export function getSupportedDomain(
  domain: Domain | undefined,
  scaleType: ScaleType,
  values: number[]
): Domain | undefined {
  if (!domain) {
    return undefined;
  }

  // If scale is not log or domain does not cross zero, domain is supported
  if (scaleType !== ScaleType.Log || domain[0] * domain[1] > 0) {
    return domain;
  }

  // Find domain again but only amongst positive values
  // Note that [-X, 0] is not supported at all and will return `undefined`
  const supportedDomain = findDomain(values.filter((x) => x > 0));

  // Clamp domain minimum to the first positive value
  return supportedDomain && [supportedDomain[0], domain[1]];
}
