import { type NumArray } from '@h5web/shared/vis-models';

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

/*
 * Cubic Hermite interpolant, from the values and slopes at both ends of interval `i`.
 * Unit-interval formula, with slopes scaled by the interval's width:
 * https://en.wikipedia.org/wiki/Cubic_Hermite_spline#Unit_interval_(0,_1)
 */
export function evalHermite(
  xs: NumArray,
  ys: NumArray,
  slopes: NumArray,
  i: number,
  t: number,
): number {
  const width = xs[i + 1] - xs[i];
  const [p0, p1] = [ys[i], ys[i + 1]];
  const [m0, m1] = [slopes[i] * width, slopes[i + 1] * width];

  const h00 = 2 * t ** 3 - 3 * t ** 2 + 1;
  const h10 = t ** 3 - 2 * t ** 2 + t;
  const h01 = -2 * t ** 3 + 3 * t ** 2;
  const h11 = t ** 3 - t ** 2;

  return h00 * p0 + h10 * m0 + h01 * p1 + h11 * m1;
}
