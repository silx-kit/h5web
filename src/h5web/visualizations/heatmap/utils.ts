import { range } from 'lodash-es';
import type { D3Interpolator, Dims } from './models';
import type { DataArray } from '../../dataset-visualizer/models';

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
