import { type H5WebComplex } from '@h5web/shared/hdf5-models';
import { ComplexVisType } from '@h5web/shared/vis-models';

const TWO_PI = 2 * Math.PI;

export const COMPLEX_VIS_TYPE_LABELS = {
  [ComplexVisType.Amplitude]: 'Amplitude',
  [ComplexVisType.Phase]: 'Phase',
  [ComplexVisType.PhaseAmplitude]: 'Phase & Amplitude',
};

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

  // Unwrap phase values by removing 2π discontinuities
  for (const [i, phaseVal] of phase.entries()) {
    if (i === 0) {
      continue;
    }

    const diff = phaseVal - phase[i - 1];
    phase[i] += -TWO_PI * Math.round(diff / TWO_PI);
  }

  return { phase, amplitude };
}
