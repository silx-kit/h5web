import type { AxisScaleType, NumArray } from '@h5web/shared/models-vis';

export interface ScatterAxisParams {
  label?: string;
  value: NumArray;
  scaleType?: AxisScaleType;
}
