import { type AxisScaleType, type NumArray } from '@h5web/shared/vis-models';

export interface ScatterAxisParams {
  label?: string;
  value: NumArray;
  scaleType?: AxisScaleType;
}
