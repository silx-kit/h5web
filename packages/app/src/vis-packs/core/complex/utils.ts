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

export function getPhaseAmplitude(values: H5WebComplex[]): {
  phase: number[];
  amplitude: number[];
} {
  const phase: number[] = Array.from({ length: values.length });
  const amplitude: number[] = Array.from({ length: values.length });

  values.forEach(([real, imag], i) => {
    phase[i] = Math.atan2(imag, real);
    amplitude[i] = Math.hypot(real, imag);
  });

  return { phase, amplitude };
}

// Unwrap phase values by removing 2π discontinuities
export function unwrapPhase(values: number[]): number[] {
  const unwrapped: number[] = Array.from({ length: values.length });

  for (const [i, val] of values.entries()) {
    if (i === 0) {
      unwrapped[0] = val;
      continue;
    }

    const diff = val - unwrapped[i - 1];
    unwrapped[i] = val - TWO_PI * Math.round(diff / TWO_PI);
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
