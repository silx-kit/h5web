import { createMemo } from '@h5web/shared/createMemo';
import {
  type ArrayValue,
  type Dataset,
  type NumericLikeType,
} from '@h5web/shared/hdf5-models';
import { type IgnoreValue, type NumArray } from '@h5web/shared/vis-models';
import { castArray } from '@h5web/shared/vis-utils';
import { type NdArray } from 'ndarray';
import { useMemo } from 'react';

import { type DimensionMapping } from '../../dimension-mapper/models';
import { isAxis } from '../../dimension-mapper/utils';
import { useDataContext } from '../../providers/DataProvider';
import {
  bigIntTypedArrayFromDType,
  typedArrayFromDType,
} from '../../providers/utils';
import { applyMapping, getBaseArray, toNumArray } from './utils';

export const useToNumArray = createMemo(toNumArray);

export function useToNumArrays(
  arrays: ArrayValue<NumericLikeType>[],
): NumArray[];

export function useToNumArrays(
  arrays: (ArrayValue<NumericLikeType> | undefined)[],
): (NumArray | undefined)[];

export function useToNumArrays(
  arrays: (ArrayValue<NumericLikeType> | undefined)[],
): (NumArray | undefined)[] {
  return useMemo(() => arrays.map(toNumArray), arrays); // eslint-disable-line react-hooks/exhaustive-deps
}

export function useBaseArray<T extends ArrayValue | undefined>(
  value: T,
  rawDims: number[],
): T extends ArrayValue ? NdArray<T> : undefined;

export function useBaseArray(
  value: ArrayValue | undefined,
  rawDims: number[],
): NdArray<ArrayValue> | undefined {
  return useMemo(() => getBaseArray(value, rawDims), [value, rawDims]);
}

export function useMappedArray<T extends ArrayValue | undefined>(
  value: T,
  dims: number[],
  mapping: DimensionMapping,
): T extends ArrayValue ? NdArray<T> : undefined;

export function useMappedArray(
  value: ArrayValue | undefined,
  dims: number[],
  mapping: DimensionMapping,
): NdArray<ArrayValue> | undefined {
  const baseArray = useBaseArray(value, dims);

  return useMemo(() => applyMapping(baseArray, mapping), [baseArray, mapping]);
}

export function useMappedArrays<T extends ArrayValue>(
  values: T[],
  dims: number[],
  mapping: DimensionMapping,
): NdArray<T>[];

export function useMappedArrays<T extends ArrayValue>(
  values: (T | undefined)[],
  dims: number[],
  mapping: DimensionMapping,
): (NdArray<T> | undefined)[];

export function useMappedArrays(
  values: (ArrayValue | undefined)[],
  dims: number[],
  mapping: DimensionMapping,
): (NdArray<ArrayValue> | undefined)[] {
  const baseArrays = useMemo(
    () => values.map((arr) => getBaseArray(arr, dims)),
    [dims, ...values], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return useMemo(
    () => baseArrays.map((ndArr) => applyMapping(ndArr, mapping)),
    [baseArrays, mapping],
  );
}

export function useSlicedDimsAndMapping(
  dims: number[],
  dimMapping: DimensionMapping,
): [number[], DimensionMapping] {
  return useMemo(
    () => [
      dims.filter((_, i) => isAxis(dimMapping[i])),
      dimMapping.filter(isAxis),
    ],
    [dimMapping, dims],
  );
}

export function useIgnoreFillValue(dataset: Dataset): IgnoreValue | undefined {
  const { attrValuesStore } = useDataContext();

  const rawFillValue = attrValuesStore.getSingle(dataset, '_FillValue');

  return useMemo(() => {
    const wrappedFillValue = castArray(rawFillValue);

    const DTypedArray = bigIntTypedArrayFromDType(dataset.type)
      ? Float64Array // matches `useToNumArray` logic
      : typedArrayFromDType(dataset.type);

    // Cast fillValue in the type of the dataset values to be able to use `===` for the comparison
    const fillValue =
      DTypedArray && typeof wrappedFillValue[0] === 'number'
        ? new DTypedArray(wrappedFillValue as number[])[0]
        : undefined;

    if (fillValue === undefined) {
      return undefined;
    }

    return (val) => val === fillValue;
  }, [dataset, rawFillValue]);
}
