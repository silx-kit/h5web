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

export function getColorScaleDomain(
  scaleType: ScaleType,
  values: number[],
  dataDomain?: Domain,
  customDomain?: Domain
): Domain | undefined {
  const domain = customDomain || dataDomain;
  if (!domain) {
    return undefined;
  }

  // If the scale is not log or if the domain does not cross zero, the domain does not need to be adjusted
  if (scaleType !== ScaleType.Log || domain[0] * domain[1] > 0) {
    return domain;
  }

  // Log only supports positives values.
  // Given the condition above, supportedDomain is only undefined if the domain is [-X, 0].
  const supportedDomain = findDomain(values.filter((x) => x > 0));
  if (supportedDomain && customDomain) {
    // Clamp custom domain minimum to the first positive value
    return [supportedDomain[0], customDomain[1]] as Domain;
  }

  return supportedDomain;
}
