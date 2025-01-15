import type { H5WebComplex } from '@h5web/shared/hdf5-models';
import type { Bounds } from '@h5web/shared/vis-models';
import { ComplexVisType } from '@h5web/shared/vis-models';
import { getNewBounds } from '@h5web/shared/vis-utils';

const INITIAL_BOUNDS: Bounds = {
  min: Infinity,
  max: -Infinity,
  positiveMin: Infinity,
  strictPositiveMin: Infinity,
};

export const COMPLEX_VIS_TYPE_LABELS = {
  [ComplexVisType.Amplitude]: 'Amplitude',
  [ComplexVisType.Phase]: 'Phase',
  [ComplexVisType.PhaseAmplitude]: 'Phase & Amplitude',
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

      const amplitude = Math.hypot(real, imag);
      amplitudeValues.push(amplitude);

      return [getNewBounds(acc[0], phase), getNewBounds(acc[1], amplitude)];
    },
    [INITIAL_BOUNDS, INITIAL_BOUNDS],
  );

  return {
    phaseValues,
    phaseBounds,
    amplitudeValues,
    amplitudeBounds,
  };
}
