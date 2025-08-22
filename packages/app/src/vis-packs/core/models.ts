import { type NumArray } from '@h5web/shared/vis-models';

export interface PhaseAmp {
  amplitude: NumArray;
  phase: NumArray | undefined; // `undefined` for numeric-like dataset
}
