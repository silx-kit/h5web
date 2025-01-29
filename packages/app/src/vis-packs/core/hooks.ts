import { createMemo } from '@h5web/shared/createMemo';
import { assertDatasetValue, isDefined } from '@h5web/shared/guards';
import {
  type ArrayShape,
  type ArrayValue,
  type Dataset,
  type NumericLikeType,
  type ScalarShape,
  type Value,
} from '@h5web/shared/hdf5-models';
import { type IgnoreValue, type NumArray } from '@h5web/shared/vis-models';
import { castArray } from '@h5web/shared/vis-utils';
import { type NdArray } from 'ndarray';
import { useMemo } from 'react';

import { type DimensionMapping } from '../../dimension-mapper/models';
import { isAxis } from '../../dimension-mapper/utils';
import { useDataContext } from '../../providers/DataProvider';
import { typedArrayFromDType } from '../../providers/utils';
import {
  applyMapping,
  getBaseArray,
  getSliceSelection,
  toNumArray,
} from './utils';

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

export function useValuesInCache(
  ...datasets: (Dataset<ScalarShape | ArrayShape> | undefined)[]
): (dimMapping: DimensionMapping) => boolean {
  const { valuesStore } = useDataContext();
  return (dimMapping) => {
    const selection = getSliceSelection(dimMapping);
    return datasets.every(
      (dataset) => !dataset || valuesStore.has({ dataset, selection }),
    );
  };
}

export function usePrefetchValues(
  datasets: (Dataset<ScalarShape | ArrayShape> | undefined)[],
  selection?: string,
): void {
  const { valuesStore } = useDataContext();
  datasets.filter(isDefined).forEach((dataset) => {
    valuesStore.prefetch({ dataset, selection });
  });
}

export function useDatasetValue<D extends Dataset<ArrayShape | ScalarShape>>(
  dataset: D,
  selection?: string,
): Value<D>;

export function useDatasetValue<D extends Dataset<ArrayShape | ScalarShape>>(
  dataset: D | undefined,
  selection?: string,
): Value<D> | undefined;

export function useDatasetValue<D extends Dataset<ArrayShape | ScalarShape>>(
  dataset: D | undefined,
  selection?: string,
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
  selection?: string,
): Value<D>[];

export function useDatasetValues<D extends Dataset<ArrayShape | ScalarShape>>(
  datasets: (D | undefined)[],
  selection?: string,
): (Value<D> | undefined)[];

export function useDatasetValues<D extends Dataset<ArrayShape | ScalarShape>>(
  datasets: (D | undefined)[],
  selection?: string,
): (Value<D> | undefined)[] {
  const { valuesStore } = useDataContext();

  return datasets.map((dataset) => {
    if (!dataset) {
      return undefined;
    }

    const value = valuesStore.get({ dataset, selection });
    assertDatasetValue(value, dataset);
    return value;
  });
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
    const DTypedArray = typedArrayFromDType(dataset.type);
    const wrappedFillValue = castArray(rawFillValue);

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
