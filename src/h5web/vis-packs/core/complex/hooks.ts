import ndarray, { NdArray } from 'ndarray';
import { useMemo } from 'react';
import { createMemo } from 'react-use';
import type { H5WebComplex } from '../../../providers/models';
import { Domain, ScaleType } from '../models';
import { DEFAULT_DOMAIN, getValidDomainForScale } from '../utils';
import { getPhaseAmplitudeValues } from './utils';

export function usePhaseAmplitudeArrays(
  mappedArray: NdArray<H5WebComplex[]>,
  scaleType: ScaleType = ScaleType.Linear
): {
  phaseArray: NdArray<number[]>;
  phaseDomain: Domain;
  amplitudeArray: NdArray<number[]>;
  amplitudeDomain: Domain;
} {
  const [phaseArray, phaseBounds, amplitudeArray, amplitudeBounds] =
    useMemo(() => {
      const { phaseValues, phaseBounds, amplitudeValues, amplitudeBounds } =
        getPhaseAmplitudeValues(mappedArray.data);

      return [
        ndarray(phaseValues, mappedArray.shape),
        phaseBounds,
        ndarray(amplitudeValues, mappedArray.shape),
        amplitudeBounds,
      ];
    }, [mappedArray]);

  const [phaseDomain, amplitudeDomain] = useMemo(
    () => [
      getValidDomainForScale(phaseBounds, scaleType) || DEFAULT_DOMAIN,
      getValidDomainForScale(amplitudeBounds, scaleType) || DEFAULT_DOMAIN,
    ],
    [amplitudeBounds, phaseBounds, scaleType]
  );

  return {
    phaseArray,
    phaseDomain,
    amplitudeArray,
    amplitudeDomain,
  };
}

export const usePhaseAmplitudeValues = createMemo(getPhaseAmplitudeValues);
