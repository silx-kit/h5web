import { type NumArray } from '@h5web/shared/vis-models';
import { type ThreeEvent } from '@react-three/fiber';
import { range } from 'd3-array';
import { useMemo } from 'react';

export function getAxisValues(
  rawValues: NumArray | undefined,
  axisLength: number,
): NumArray {
  if (!rawValues) {
    return range(axisLength);
  }

  if (rawValues.length < axisLength) {
    throw new Error(`Expected array to have length ${axisLength} at least`);
  }

  return rawValues.slice(0, axisLength);
}

export function useEventHandler<T extends MouseEvent | PointerEvent>(
  handler: ((index: number, evt: ThreeEvent<T>) => void) | undefined,
): ((evt: ThreeEvent<T>) => void) | undefined {
  return useMemo(() => {
    return (
      handler &&
      ((evt: ThreeEvent<T>) => {
        if (evt.index !== undefined) {
          handler(evt.index, evt);
        }
      })
    );
  }, [handler]);
}

/**
 * Slopes of the shape-preserving PCHIP interpolant (Fritsch–Carlson), as in Moler,
 * _Numerical Computing with MATLAB_, §3.4.
 * https://www.mathworks.com/content/dam/mathworks/mathworks-dot-com/moler/interp.pdf
 * Non-finite points split the curve into independent pieces.
 */
export function getPchipSlopes(xs: NumArray, ys: NumArray): Float64Array {
  function width(i: number): number {
    return xs[i + 1] - xs[i];
  }

  function secant(i: number): number {
    return i >= 0 && i < xs.length - 1
      ? (ys[i + 1] - ys[i]) / width(i)
      : Number.NaN;
  }

  function getSlope(i: number): number {
    const left = secant(i - 1);
    const right = secant(i);

    if (Number.isFinite(left) && Number.isFinite(right)) {
      if (left * right <= 0 || width(i - 1) * width(i) <= 0) {
        return 0; // local extremum, or abscissas reverse direction
      }
      const w1 = 2 * width(i) + width(i - 1);
      const w2 = width(i) + 2 * width(i - 1);
      return (w1 + w2) / (w1 / left + w2 / right);
    }

    if (Number.isFinite(right)) {
      return getPchipEndSlope(width(i), width(i + 1), right, secant(i + 1));
    }

    if (Number.isFinite(left)) {
      return getPchipEndSlope(width(i - 1), width(i - 2), left, secant(i - 2));
    }

    return 0;
  }

  const slopes = new Float64Array(xs.length);
  for (let i = 0; i < xs.length; i++) {
    slopes[i] = getSlope(i);
  }
  return slopes;
}

// One-sided three-point estimate, clamped so the end interval cannot overshoot
function getPchipEndSlope(
  h1: number,
  h2: number,
  delta1: number,
  delta2: number,
): number {
  if (!Number.isFinite(delta2) || h1 * h2 <= 0) {
    return delta1;
  }

  const slope = ((2 * h1 + h2) * delta1 - h1 * delta2) / (h1 + h2);

  if (Math.sign(slope) !== Math.sign(delta1)) {
    return 0;
  }
  if (
    Math.sign(delta1) !== Math.sign(delta2) &&
    Math.abs(slope) > Math.abs(3 * delta1)
  ) {
    return 3 * delta1;
  }
  return slope;
}
