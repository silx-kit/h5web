import { type H5WebComplex } from '@h5web/shared/hdf5-models';
import { cplx } from '@h5web/shared/hdf5-utils';
import { describe, expect, it } from 'vitest';

import { getPhaseAmplitude, getPhaseAmplitudeArrays } from './utils';

const TWO_PI = 2 * Math.PI;

/* Straightforward reference implementations, kept deliberately naive. The real
   ones are written to avoid per-element allocation on large datasets, so they
   are checked against these rather than against hand-written expectations. */
function referencePhaseAmplitude(values: H5WebComplex[]): {
  phase: number[];
  amplitude: number[];
} {
  return {
    phase: values.map(([real, imag]) => Math.atan2(imag, real)),
    amplitude: values.map(([real, imag]) => Math.hypot(real, imag)),
  };
}

function referenceUnwrap(values: number[]): number[] {
  const unwrapped: number[] = [];

  values.forEach((val, i) => {
    if (i === 0) {
      unwrapped.push(val);
      return;
    }

    const diff = val - unwrapped[i - 1];
    unwrapped.push(val - TWO_PI * Math.round(diff / TWO_PI));
  });

  return unwrapped;
}

/* Deterministic generator (MINSTD), so a failing case is reproducible. Values
   straddle the branch cut of `atan2` at the negative real axis, where phase
   jumps by 2π and unwrapping has to do real work. */
function makeComplex(seed: number, length: number): H5WebComplex[] {
  let state = seed;

  function next(): number {
    state = (state * 48_271) % 2_147_483_647;
    return state / 2_147_483_647;
  }

  return Array.from({ length }, () => {
    const angle = (next() - 0.5) * 8 * Math.PI; // several turns, so phase wraps
    const radius = next() * 10;
    return cplx(radius * Math.cos(angle), radius * Math.sin(angle));
  });
}

function unwrapOf(values: H5WebComplex[]): number[] {
  const { unwrappedPhaseArrays } = getPhaseAmplitudeArrays([values]);
  return [...unwrappedPhaseArrays[0]];
}

describe('getPhaseAmplitude', () => {
  it('should match the reference implementation', () => {
    for (let seed = 1; seed <= 50; seed += 1) {
      const values = makeComplex(seed, 64);
      const { phase, amplitude } = getPhaseAmplitude(values);
      const expected = referencePhaseAmplitude(values);

      expect({ seed, phase: [...phase] }).toStrictEqual({
        seed,
        phase: expected.phase,
      });
      expect({ seed, amplitude: [...amplitude] }).toStrictEqual({
        seed,
        amplitude: expected.amplitude,
      });
    }
  });

  it('should handle the values that break polar conversions', () => {
    // Both zero (phase undefined, conventionally 0) and the negative real axis
    const values = [cplx(0, 0), cplx(-1, 0), cplx(0, -1), cplx(-0, -0)];
    const { phase, amplitude } = getPhaseAmplitude(values);

    expect([...amplitude]).toStrictEqual([0, 1, 1, 0]);
    expect([...phase]).toStrictEqual(referencePhaseAmplitude(values).phase);
  });

  it('should return empty arrays for no values', () => {
    const { phase, amplitude } = getPhaseAmplitude([]);

    expect(phase).toHaveLength(0);
    expect(amplitude).toHaveLength(0);
  });

  /* Property: amplitude and phase are polar coordinates, so they must
     reconstruct the original components. This pins down the pairing of the two
     outputs, which comparing each against a reference separately does not. */
  it('should be invertible back to the original components', () => {
    const values = makeComplex(7, 200);
    const { phase, amplitude } = getPhaseAmplitude(values);

    values.forEach(([real, imag], i) => {
      expect(amplitude[i] * Math.cos(phase[i])).toBeCloseTo(real, 10);
      expect(amplitude[i] * Math.sin(phase[i])).toBeCloseTo(imag, 10);
    });
  });
});

describe('getPhaseAmplitudeArrays', () => {
  it('should match the reference unwrapping', () => {
    for (let seed = 1; seed <= 50; seed += 1) {
      const values = makeComplex(seed, 64);
      const { phase } = getPhaseAmplitude(values);

      expect({ seed, unwrapped: unwrapOf(values) }).toStrictEqual({
        seed,
        unwrapped: referenceUnwrap([...phase]),
      });
    }
  });

  /* Properties that define phase unwrapping: it may add whole turns to each
     value, and must leave no jump bigger than half a turn between neighbours. */
  it('should remove every 2-pi discontinuity without moving any value off its turn', () => {
    const values = makeComplex(11, 500);
    const { phase } = getPhaseAmplitude(values);
    const unwrapped = unwrapOf(values);

    expect(unwrapped).toHaveLength(values.length);
    expect(unwrapped[0]).toBe(phase[0]); // first value is never shifted

    unwrapped.forEach((val, i) => {
      // Differs from the wrapped phase only by a whole number of turns
      const turns = (val - phase[i]) / TWO_PI;
      expect(turns).toBeCloseTo(Math.round(turns), 9);
    });

    // No jump bigger than half a turn survives anywhere in the sequence
    const jumps = unwrapped
      .slice(1)
      .map((val, i) => Math.abs(val - unwrapped[i]));

    expect(Math.max(...jumps)).toBeLessThanOrEqual(Math.PI + 1e-9);
  });

  it('should treat real values as complex with zero imaginary part', () => {
    const { phaseArrays, amplitudeArrays } = getPhaseAmplitudeArrays([
      [-3, 0, 4],
    ]);

    expect([...phaseArrays[0]]).toStrictEqual([0, 0, 0]);
    expect([...amplitudeArrays[0]]).toStrictEqual([3, 0, 4]);
  });
});
