import { createMemo } from '@h5web/shared/createMemo';
import { isComplexArray } from '@h5web/shared/guards';
import {
  type ArrayValue,
  type ComplexType,
  type NumericLikeType,
} from '@h5web/shared/hdf5-models';
import { type NumArray } from '@h5web/shared/vis-models';

import { toNumArray } from '../utils';
import { getPhaseAmplitude } from './utils';

export const usePhaseAmplitude = createMemo(getPhaseAmplitude);

export function usePhaseAmplitudeArrays(
  values: ArrayValue<NumericLikeType | ComplexType>[],
): { phaseArrays: NumArray[]; amplitudeArrays: NumArray[] } {
  const phaseArrays: NumArray[] = [];
  const amplitudeArrays: NumArray[] = [];

  values.forEach((arr) => {
    if (isComplexArray(arr)) {
      const { phase, amplitude } = getPhaseAmplitude(arr);
      phaseArrays.push(phase);
      amplitudeArrays.push(amplitude);
      return;
    }

    // Consider real numbers as complex numbers with no imaginary parts
    const numArray = toNumArray(arr);
    phaseArrays.push(numArray.map(() => 0));
    amplitudeArrays.push(numArray.map((v) => Math.abs(v)));
  });

  return { phaseArrays, amplitudeArrays };
}
