import { mockValues } from '@h5web/lib';
import { describe, expect, it } from 'vitest';

import { getPhaseAmplitude, unwrapPhase } from './utils';

const VALUES = mockValues.oneD_complex().data;

function expectCloseTo(sourceArray: Float64Array, expectedArray: number[]) {
  sourceArray.forEach((val, i) => {
    expect(val, `index=${i}`).toBeCloseTo(expectedArray[i], 1);
  });
}

describe('getPhaseAmplitude', () => {
  it('should compute phase and amplitude of complex numbers', () => {
    const { phase, amplitude } = getPhaseAmplitude(VALUES);

    expectCloseTo(amplitude, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expectCloseTo(phase, [
      Math.PI,
      0,
      Math.PI,
      0,
      Math.PI,
      0,
      Math.PI,
      0,
      Math.PI,
      0,
    ]);
  });
});

describe('unwrapPhase', () => {
  it('should unwrap phase values by removing 2π discontinuities', () => {
    const { phase } = getPhaseAmplitude(VALUES);
    const unwrapped = unwrapPhase(phase);

    expectCloseTo(unwrapped, [
      Math.PI,
      2 * Math.PI,
      3 * Math.PI,
      4 * Math.PI,
      5 * Math.PI,
      6 * Math.PI,
      7 * Math.PI,
      8 * Math.PI,
      9 * Math.PI,
      10 * Math.PI,
    ]);
  });

  it('should handle arrays with 0 or 1 values', () => {
    const unwrapped1 = unwrapPhase(new Float64Array([]));
    expect(unwrapped1).toStrictEqual(new Float64Array([]));

    const unwrapped2 = unwrapPhase(new Float64Array([2 * Math.PI]));
    expect(unwrapped2).toStrictEqual(new Float64Array([2 * Math.PI]));
  });
});
