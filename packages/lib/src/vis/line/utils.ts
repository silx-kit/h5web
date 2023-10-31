import type { NumArray } from '@h5web/shared';
import { range } from 'd3-array';

export function getAxisValues(
  rawValues: NumArray | undefined,
  axisLength: number,
): NumArray {
  if (!rawValues) {
    return range(axisLength);
  }

  if (rawValues.length < axisLength) {
    throw new Error(`Expected array to have length ${axisLength} at least`);
  }

  return rawValues.slice(0, axisLength);
}
