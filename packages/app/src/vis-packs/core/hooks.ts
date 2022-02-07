import { getCombinedDomain } from '@h5web/lib';
import type {
  AnyNumArray,
  ArrayShape,
  Dataset,
  Domain,
  NumArray,
  ScalarShape,
  Value,
} from '@h5web/shared';
import {
  isDefined,
  ScaleType,
  getBounds,
  getValidDomainForScale,
  assertDatasetValue,
} from '@h5web/shared';
import type { NdArray, TypedArray } from 'ndarray';
import { useContext, useMemo } from 'react';
import { createMemo } from 'react-use';

import type { DimensionMapping } from '../../dimension-mapper/models';
import { isAxis } from '../../dimension-mapper/utils';
import { ProviderContext } from '../../providers/context';
import { applyMapping, getBaseArray } from './utils';

export function usePrefetchValues(
  datasets: (Dataset<ScalarShape | ArrayShape> | undefined)[],
  selection?: string
): void {
  const { valuesStore } = useContext(ProviderContext);
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
  const { valuesStore } = useContext(ProviderContext);

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
  const { valuesStore } = useContext(ProviderContext);

  return Object.fromEntries(
    datasets.map((dataset) => {
      const value = valuesStore.get({ dataset, selection });
      assertDatasetValue(value, dataset);

      return [dataset.name, value];
    })
  );
}

const useBounds = createMemo(getBounds);
const useValidDomainForScale = createMemo(getValidDomainForScale);

export function useDomain(
  valuesArray: AnyNumArray,
  scaleType: ScaleType = ScaleType.Linear,
  errorArray?: AnyNumArray
): Domain | undefined {
  // Distinct memoized calls allows for bounds to not be recomputed when scale type changes
  const bounds = useBounds(valuesArray, errorArray);
  return useValidDomainForScale(bounds, scaleType);
}

export function useDomains(
  valuesArrays: AnyNumArray[],
  scaleType: ScaleType = ScaleType.Linear
): (Domain | undefined)[] {
  const allBounds = useMemo(() => {
    return valuesArrays.map((arr) => getBounds(arr));
  }, [valuesArrays]);

  return useMemo(
    () => allBounds.map((bounds) => getValidDomainForScale(bounds, scaleType)),
    [allBounds, scaleType]
  );
}

export const useCombinedDomain = createMemo(getCombinedDomain);

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

const useApplyMapping = createMemo(applyMapping);

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
  const mappedArray = useApplyMapping(baseArray, mapping);

  return [mappedArray, autoScale ? mappedArray : baseArray];
}

export function useMappedArrays(
  values: NumArray[],
  dims: number[],
  mapping: DimensionMapping,
  autoScale?: boolean
): [NdArray<NumArray>[], NdArray<NumArray>[]] {
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
