import type { Domain } from '@h5web/lib';
import { getValidDomainForScale } from '@h5web/lib/src/h5web/vis-packs/core/utils';
import type { H5WebComplex } from '@h5web/shared';
import { ScaleType } from '@h5web/shared';
import type { NdArray } from 'ndarray';
import ndarray from 'ndarray';
import { useMemo } from 'react';
import { createMemo } from 'react-use';
import { DEFAULT_DOMAIN } from '../utils';
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
