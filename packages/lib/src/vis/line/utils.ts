import type { NumArray } from '@h5web/shared';

import type { Scale } from '../models';

const NO_ERROR_POSITIONS = {
  topCap: undefined,
  bottomCap: undefined,
  bar: undefined,
};

export function getValueToPosition(
  abscissas: NumArray,
  abscissaScale: Scale,
  ordinateScale: Scale,
  ignoreValue?: (val: number) => boolean
): (value: number, index: number) => [number, number] | undefined {
  return (value: number, index: number) => {
    const x = abscissaScale(abscissas[index]);
    const y = ordinateScale(value);

    const isIgnored = ignoreValue ? ignoreValue(value) : false;
    const hasFiniteCoords = Number.isFinite(x) && Number.isFinite(y);

    return !isIgnored && hasFiniteCoords ? [x, y] : undefined;
  };
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export function getValueToErrorPositions(
  errors: NumArray | undefined,
  ordinateScale: Scale
): (
  value: number,
  index: number,
  position: [number, number] | undefined
) => {
  topCap: [number, number] | undefined;
  bottomCap: [number, number] | undefined;
  bar: [number, number, number, number] | undefined;
} {
  if (!errors) {
    return () => NO_ERROR_POSITIONS;
  }

  return (value, index, position) => {
    if (!position) {
      return NO_ERROR_POSITIONS;
    }

    const [x, y] = position;
    const error = errors[index];
    if (error < 0) {
      return NO_ERROR_POSITIONS;
    }

    const yCapTop = ordinateScale(value + error);
    const yCapBottom = ordinateScale(value - error);

    const showTopCap = Number.isFinite(yCapTop);
    const showBottomCap = Number.isFinite(yCapBottom);

    const yBarTop = showTopCap ? yCapTop : y;
    const yBarBottom = showBottomCap ? yCapBottom : y;
    const showBar = showTopCap || showBottomCap;

    return {
      topCap: showTopCap ? [x, yCapTop] : undefined,
      bottomCap: showBottomCap ? [x, yCapBottom] : undefined,
      bar: showBar ? [x, yBarTop, x, yBarBottom] : undefined,
    };
  };
}
