import { type DimensionMapping } from '@h5web/lib';
import { createMemo } from '@h5web/shared/createMemo';
import { isDefined } from '@h5web/shared/guards';
import {
  type ArrayValue,
  type Dataset,
  type NumericLikeType,
} from '@h5web/shared/hdf5-models';
import {
  type BuiltInExporter,
  type ExportEntry,
  type ExportFormat,
  type NumArray,
} from '@h5web/shared/vis-models';
import { useToggle } from '@react-hookz/web';
import { type NdArray } from 'ndarray';
import { useCallback, useMemo } from 'react';

import { useDataContext } from '../../providers/DataProvider';
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

export function useExportEntries<F extends ExportFormat[]>(
  formats: F,
  dataset: Dataset,
  selection?: string,
  exporters: Partial<Record<F[number], BuiltInExporter>> = {},
): ExportEntry[] {
  const { getExportURL } = useDataContext();

  return formats
    .map((format: F[number]) => {
      const url = getExportURL?.(format, dataset, selection, exporters[format]);
      return url ? { format, url } : undefined;
    })
    .filter(isDefined);
}

export function useSuggestion<T>(
  suggestion: T | undefined,
  storeValue: T,
  storeSetter: (val: T) => void,
): [T, (val: T) => void] {
  const [isIgnored, ignoreSuggestion] = useToggle();

  const patchedSetter = useCallback(
    (val: T) => {
      storeSetter(val);
      ignoreSuggestion();
    },
    [storeSetter, ignoreSuggestion],
  );

  if (isIgnored || !isDefined(suggestion)) {
    return [storeValue, storeSetter];
  }

  return [suggestion, patchedSetter];
}
