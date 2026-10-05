import { describe, expect, it } from 'vitest';

import { getPchipSlopes } from './utils';

// Irregularly spaced, non-monotonic data with flat runs
const xs = Float64Array.from({ length: 200 }, (_, i) => i + Math.sin(i) ** 2);
const ys = Float64Array.from(xs, (_, i) => Math.round(4 * Math.sin(i * i)));

describe('getPchipSlopes', () => {
  it('should match SciPy `PchipInterpolator`', () => {
    const slopes = getPchipSlopes([0, 1, 1.5, 4, 5, 7], [0, 2, 1, 1.2, 3, -1]);
    const expected = [14 / 3, 0, 0, 126 / 715, 0, -68 / 15];
    for (const [i, slope] of expected.entries()) {
      expect(slopes[i]).toBeCloseTo(slope, 12);
    }

    // Start slope is clamped to three times the first secant
    const clamped = getPchipSlopes([0, 1, 1.1], [0, 1, 0]);
    expect(clamped[0]).toBeCloseTo(3, 12);
    expect(clamped[2]).toBeCloseTo(-11, 12);
  });

  it.each([
    ['increasing', xs],
    ['decreasing', xs.map((x) => -x)],
    ['back-and-forth', xs.map((x, i) => (i % 3 === 2 ? x - 3 : x))],
  ])(
    'should keep every interval within the range of its end values, with %s abscissas',
    (_, abscissas) => {
      const slopes = getPchipSlopes(abscissas, ys);

      // Fritsch–Carlson sufficient condition: slopes are 0–3 times the secant
      for (let i = 0; i < abscissas.length - 1; i++) {
        const secant = (ys[i + 1] - ys[i]) / (abscissas[i + 1] - abscissas[i]);
        for (const slope of [slopes[i], slopes[i + 1]]) {
          expect(slope * secant).toBeGreaterThanOrEqual(0);
          expect(Math.abs(slope)).toBeLessThanOrEqual(3 * Math.abs(secant));
        }
      }
    },
  );

  it('should not depend on the direction of the data', () => {
    const reversed = getPchipSlopes(xs.toReversed(), ys.toReversed());
    expect(reversed.toReversed()).toStrictEqual(getPchipSlopes(xs, ys));
  });

  it('should treat non-finite values as breaks between independent curves', () => {
    const gap = [...ys.slice(0, 100), Number.NaN, ...ys.slice(101)];
    const slopes = getPchipSlopes(xs, gap);

    expect(slopes.slice(0, 100)).toStrictEqual(
      getPchipSlopes(xs.slice(0, 100), ys.slice(0, 100)),
    );
    expect(slopes.slice(101)).toStrictEqual(
      getPchipSlopes(xs.slice(101), ys.slice(101)),
    );
  });
});
