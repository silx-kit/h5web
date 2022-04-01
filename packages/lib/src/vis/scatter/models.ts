import type { NumArray, ScaleType } from '@h5web/shared';

export interface ScatterAxisParams {
  label?: string;
  value: NumArray;
  scaleType?: ScaleType;
}
