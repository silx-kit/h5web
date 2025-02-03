import { type NumArray } from '@h5web/shared/vis-models';
import { type ThreeEvent } from '@react-three/fiber';
import { range } from 'd3-array';
import { useMemo } from 'react';

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

export function useEventHandler<T extends MouseEvent | PointerEvent>(
  handler: ((index: number, evt: ThreeEvent<T>) => void) | undefined,
): ((evt: ThreeEvent<T>) => void) | undefined {
  return useMemo(() => {
    return (
      handler &&
      ((evt: ThreeEvent<T>) => {
        if (evt.index !== undefined) {
          handler(evt.index, evt);
        }
      })
    );
  }, [handler]);
}
