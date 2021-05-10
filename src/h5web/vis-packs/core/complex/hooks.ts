import ndarray, { NdArray } from 'ndarray';
import { useMemo } from 'react';
import type { H5WebComplex } from '../../../providers/models';
import { Bounds, Domain, ScaleType } from '../models';
import { DEFAULT_DOMAIN, getValidDomainForScale, getNewBounds } from '../utils';

const INITIAL_BOUNDS: Bounds = {
  min: Infinity,
  max: -Infinity,
  positiveMin: Infinity,
};

export function usePhaseAmplitude(
  mappedArray: NdArray<H5WebComplex>,
  scaleType: ScaleType = ScaleType.Linear
): {
  phaseArray: NdArray;
  phaseDomain: Domain;
  amplitudeArray: NdArray;
  amplitudeDomain: Domain;
} {
  const [
    phaseArray,
    phaseBounds,
    amplitudeArray,
    amplitudeBounds,
  ] = useMemo(() => {
    const phaseValues: number[] = [];
    const amplitudeValues: number[] = [];

    const mappedValues = mappedArray.data as H5WebComplex[];
    const [phaseBounds, amplitudeBounds] = mappedValues.reduce(
      (acc, [real, imag]) => {
        const phase = Math.atan2(imag, real);
        phaseValues.push(phase);

        const amplitude = Math.sqrt(real ** 2 + imag ** 2);
        amplitudeValues.push(amplitude);

        return [getNewBounds(acc[0], phase), getNewBounds(acc[1], amplitude)];
      },
      [INITIAL_BOUNDS, INITIAL_BOUNDS]
    );

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
