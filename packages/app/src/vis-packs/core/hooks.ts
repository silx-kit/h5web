import type {
  ArrayShape,
  Dataset,
  NumArray,
  ScalarShape,
  Value,
} from '@h5web/shared';
import { isDefined, assertDatasetValue } from '@h5web/shared';
import type { NdArray, TypedArray } from 'ndarray';
import { useMemo } from 'react';

import type { DimensionMapping } from '../../dimension-mapper/models';
import { isAxis } from '../../dimension-mapper/utils';
import { useDataContext } from '../../providers/DataProvider';
import { applyMapping, getBaseArray } from './utils';

export function usePrefetchValues(
  datasets: (Dataset<ScalarShape | ArrayShape> | undefined)[],
  selection?: string
): void {
  const { valuesStore } = useDataContext();
  datasets.filter(isDefined).forEach((dataset) => {
    valuesStore.prefetch({ dataset, selection });
  });
}

export function useDatasetValue<D extends Dataset<ArrayShape | ScalarShape>>(
  dataset: D,
  selection?: string
): Value<D>;

export function useDatasetValue<D extends Dataset<ArrayShape | ScalarShape>>(
  dataset: D | undefined,
  selection?: string
): Value<D> | undefined;

export function useDatasetValue<D extends Dataset<ArrayShape | ScalarShape>>(
  dataset: D | undefined,
  selection?: string
): Value<D> | undefined {
  const { valuesStore } = useDataContext();

  if (!dataset) {
    return undefined;
  }

  // If `selection` is undefined, the entire dataset will be fetched
  const value = valuesStore.get({ dataset, selection });

  assertDatasetValue(value, dataset);
  return value;
}

export function useDatasetValues<D extends Dataset<ArrayShape | ScalarShape>>(
  datasets: D[],
  selection?: string
): Record<string, Value<D>> {
  const { valuesStore } = useDataContext();

  return Object.fromEntries(
    datasets.map((dataset) => {
      const value = valuesStore.get({ dataset, selection });
      assertDatasetValue(value, dataset);

      return [dataset.name, value];
    })
  );
}

export function useBaseArray<T, U extends T[] | TypedArray | undefined>(
  value: U,
  rawDims: number[]
): U extends T[] | TypedArray ? NdArray<U> : undefined;

export function useBaseArray<T>(
  value: T[] | TypedArray | undefined,
  rawDims: number[]
) {
  return useMemo(() => getBaseArray(value, rawDims), [value, rawDims]);
}

export function useMappedArray<T, U extends T[] | TypedArray | undefined>(
  value: U,
  dims: number[],
  mapping: DimensionMapping,
  autoScale?: boolean
): U extends T[] | TypedArray
  ? [NdArray<U>, NdArray<U>]
  : [undefined, undefined];

export function useMappedArray<T>(
  value: T[] | TypedArray | undefined,
  dims: number[],
  mapping: DimensionMapping,
  autoScale?: boolean
) {
  const baseArray = useBaseArray(value, dims);

  const mappedArray = useMemo(
    () => applyMapping(baseArray, mapping),
    [baseArray, mapping]
  );

  return [mappedArray, autoScale ? mappedArray : baseArray];
}

export function useMappedArrays(
  values: NumArray[],
  dims: number[],
  mapping: DimensionMapping,
  autoScale?: boolean
): [NdArray<NumArray>[], NdArray<NumArray>[]];
export function useMappedArrays(
  values: (NumArray | undefined)[],
  dims: number[],
  mapping: DimensionMapping,
  autoScale?: boolean
): [(NdArray<NumArray> | undefined)[], (NdArray<NumArray> | undefined)[]];
export function useMappedArrays(
  values: (NumArray | undefined)[],
  dims: number[],
  mapping: DimensionMapping,
  autoScale?: boolean
): [(NdArray<NumArray> | undefined)[], (NdArray<NumArray> | undefined)[]] {
  const baseArrays = useMemo(
    () => values.map((arr) => getBaseArray(arr, dims)),
    [dims, values]
  );

  const mappedArrays = useMemo(
    () => baseArrays.map((ndArr) => applyMapping(ndArr, mapping)),
    [baseArrays, mapping]
  );

  return [mappedArrays, autoScale ? mappedArrays : baseArrays];
}

export function useSlicedDimsAndMapping(
  dims: number[],
  dimMapping: DimensionMapping
): [number[], DimensionMapping] {
  return useMemo(
    () => [
      dims.filter((_, i) => isAxis(dimMapping[i])),
      dimMapping.filter(isAxis),
    ],
    [dimMapping, dims]
  );
}
