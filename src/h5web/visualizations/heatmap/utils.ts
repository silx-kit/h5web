import { range } from 'lodash-es';
import type ndarray from 'ndarray';
import type { D3Interpolator, Dims } from './models';

export function getDims(dataArray: ndarray<number>): Dims {
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

export function getPixelEdges(
  pixelCoordinates: number[] | undefined,
  nPixels: number
): number[] {
  if (!pixelCoordinates) {
    return range(nPixels + 1);
  }

  if (pixelCoordinates.length === nPixels + 1) {
    return pixelCoordinates;
  }

  if (pixelCoordinates.length === nPixels) {
    // Add the last edge assuming the pixelCoordinates are regularly spaced
    const deltaCoord = pixelCoordinates[1] - pixelCoordinates[0];
    return [
      ...pixelCoordinates,
      pixelCoordinates[pixelCoordinates.length - 1] + deltaCoord,
    ];
  }

  throw new Error(
    `Supplied pixel coordinate array (${
      pixelCoordinates.length
    }) has not the expected length (${nPixels} or ${nPixels + 1})`
  );
}
