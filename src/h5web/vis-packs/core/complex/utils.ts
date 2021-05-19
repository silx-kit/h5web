import type { H5WebComplex } from '../../../providers/models';
import type { Bounds } from '../models';
import { getNewBounds } from '../utils';

const INITIAL_BOUNDS: Bounds = {
  min: Infinity,
  max: -Infinity,
  positiveMin: Infinity,
};

export function getPhaseAmplitudeValues(mappedValues: H5WebComplex[]): {
  phaseValues: number[];
  phaseBounds: Bounds;
  amplitudeValues: number[];
  amplitudeBounds: Bounds;
} {
  const phaseValues: number[] = [];
  const amplitudeValues: number[] = [];

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

  return {
    phaseValues,
    phaseBounds,
    amplitudeValues,
    amplitudeBounds,
  };
}
