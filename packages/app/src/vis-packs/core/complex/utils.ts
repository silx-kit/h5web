import { isComplexArray } from '@h5web/shared/guards';
import {
  type ArrayValue,
  type ComplexType,
  type H5WebComplex,
  type NumericLikeType,
} from '@h5web/shared/hdf5-models';
import { ComplexVisType, type NumArray } from '@h5web/shared/vis-models';

import { toNumArray } from '../utils';

const TWO_PI = 2 * Math.PI;

export const COMPLEX_VIS_TYPE_LABELS = {
  [ComplexVisType.Amplitude]: 'Amplitude',
  [ComplexVisType.Phase]: 'Phase',
  [ComplexVisType.PhaseUnwrapped]: 'Phase, unwrapped',
  [ComplexVisType.PhaseAmplitude]: 'Phase & Amplitude',
} satisfies Record<ComplexVisType, string>;

/* The output arrays are `Float64Array`s rather than `number[]`: an array built
 * with `Array.from({ length })` is filled with `undefined`, which fixes its V8
 * elements kind as `PACKED_ELEMENTS`, so every phase and amplitude written into
 * it is boxed as a separate heap number. */
export function getPhaseAmplitude(values: H5WebComplex[]): {
  phase: NumArray;
  amplitude: NumArray;
} {
  const phase = new Float64Array(values.length);
  const amplitude = new Float64Array(values.length);

  /* Iterate by index: destructuring in a `forEach` callback allocates per
   * element, which dominates the scan once the boxing is gone. */
  // eslint-disable-next-line unicorn/no-for-loop -- see above
  for (let i = 0; i < values.length; i += 1) {
    const [real, imag] = values[i];
    phase[i] = Math.atan2(imag, real);
    amplitude[i] = Math.hypot(real, imag);
  }

  return { phase, amplitude };
}

// Unwrap phase values by removing 2π discontinuities
function unwrapPhase(values: NumArray): NumArray {
  const unwrapped = new Float64Array(values.length);

  /* Carry the previous unwrapped value rather than reading it back, and index
   * rather than using `values.entries()`, which allocates a pair per element. */
  let previous = 0;
  // eslint-disable-next-line unicorn/no-for-loop -- see above
  for (let i = 0; i < values.length; i += 1) {
    const val = values[i];
    const diff = val - previous;
    previous = i === 0 ? val : val - TWO_PI * Math.round(diff / TWO_PI);
    unwrapped[i] = previous;
  }

  return unwrapped;
}

export function getPhaseAmplitudeArrays(
  values: ArrayValue<NumericLikeType | ComplexType>[],
): {
  phaseArrays: NumArray[];
  unwrappedPhaseArrays: NumArray[];
  amplitudeArrays: NumArray[];
} {
  const phaseArrays: NumArray[] = [];
  const unwrappedPhaseArrays: NumArray[] = [];
  const amplitudeArrays: NumArray[] = [];

  values.forEach((arr) => {
    if (isComplexArray(arr)) {
      const { phase, amplitude } = getPhaseAmplitude(arr);
      phaseArrays.push(phase);
      unwrappedPhaseArrays.push(unwrapPhase(phase));
      amplitudeArrays.push(amplitude);
      return;
    }

    // Consider real numbers as complex numbers with no imaginary parts
    const numArray = toNumArray(arr);
    const phaseArray = numArray.map(() => 0);

    phaseArrays.push(phaseArray);
    unwrappedPhaseArrays.push([...phaseArray]);
    amplitudeArrays.push(numArray.map((v) => Math.abs(v)));
  });

  return { phaseArrays, unwrappedPhaseArrays, amplitudeArrays };
}
