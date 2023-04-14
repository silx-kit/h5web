import { useDomain } from '@h5web/lib';
import { type ArrayShape, type Domain } from '@h5web/shared';
import ndarray, { type NdArray } from 'ndarray';
import { useMemo } from 'react';

type NestedNumArray = (number | NestedNumArray)[];

export function useMockData(
  mockNumArray: NestedNumArray,
  shape: ArrayShape = [mockNumArray.length]
): { values: NdArray<Float32Array>; domain: Domain } {
  const values = useMemo(
    () => ndarray(Float32Array.from(mockNumArray.flat() as number[]), shape),
    [mockNumArray, shape]
  );

  const domain = useDomain(values) || [1, 2];

  return { values, domain };
}
