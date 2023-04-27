import type { AxisScaleType, NumArray } from '@h5web/shared';

export interface ScatterAxisParams {
  label?: string;
  value: NumArray;
  scaleType?: AxisScaleType;
}
