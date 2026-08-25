import { type DimensionMapping, getSliceSelection } from '@h5web/lib';
import {
  assertDataset,
  assertShape,
  assertType,
  assertValue,
  isDefined,
} from '@h5web/shared/guards';
import {
  type ArrayShape,
  type Dataset,
  type DatasetDef,
  type DatasetFromDef,
  type ProvidedEntity,
  type ScalarShape,
  type Value,
} from '@h5web/shared/hdf5-models';
import { useSuspenseQueries } from '@tanstack/react-query';

import { useDataContext } from './providers/DataProvider';
import { type ValuesStoreParams } from './providers/models';

export function useEntity(path: string): ProvidedEntity {
  const { entitiesStore } = useDataContext();
  return entitiesStore.get(path);
}

export function useDatasets<R extends Record<string, DatasetDef>>(
  defs: R,
): { [K in keyof R]: DatasetFromDef<R[K]> } {
  const { entitiesStore } = useDataContext();

  Object.values(defs).forEach((def) => {
    entitiesStore.prefetch(def.path);
  });

  return Object.fromEntries(
    Object.entries(defs).map(([key, def]) => {
      const entity = entitiesStore.get(def.path);

      assertDataset(entity);

      if (def.shape) {
        assertShape(entity, def.shape);
      }

      if (def.type) {
        assertType(entity, def.type);
      }

      return [key, entity];
    }),
  ) as { [K in keyof R]: DatasetFromDef<R[K]> };
}

export function useValue<D extends Dataset<ArrayShape | ScalarShape>>(
  dataset: D,
  selection?: string,
): Value<D>;

export function useValue<D extends Dataset<ArrayShape | ScalarShape>>(
  dataset: D | undefined,
  selection?: string,
): Value<D> | undefined;

export function useValue<D extends Dataset<ArrayShape | ScalarShape>>(
  dataset: D | undefined,
  selection?: string,
): Value<D> | undefined {
  const { queries } = useDataContext();

  const [result] = useSuspenseQueries({
    queries: [...(dataset ? [queries.value(dataset, selection)] : [])],
  });

  if (!dataset) {
    return undefined;
  }

  assertValue(result.data, dataset);
  return result.data;
}

type ValueFromParams<
  T extends ValuesStoreParams['dataset'] | ValuesStoreParams,
> = Value<T extends ValuesStoreParams ? T['dataset'] : T>;

export function useValues<
  R extends Record<string, ValuesStoreParams['dataset'] | ValuesStoreParams>,
>(datasets: R): { [K in keyof R]: ValueFromParams<R[K]> } {
  const { queries } = useDataContext();

  const keys = Object.keys(datasets);
  const storeParams = Object.values(datasets).map((datasetOrStoreParams) => {
    return 'dataset' in datasetOrStoreParams
      ? datasetOrStoreParams // already store params => keep as is
      : { dataset: datasetOrStoreParams }; // dataset => prepare store params
  });

  const results = useSuspenseQueries({
    queries: storeParams.map(({ dataset, selection }) => {
      return queries.value(dataset, selection);
    }),
  });

  return Object.fromEntries(
    results.map(({ data }, i) => {
      assertValue(data, storeParams[i].dataset);
      return [keys[i], data];
    }),
  ) as { [K in keyof R]: ValueFromParams<R[K]> };
}

export function useValuesInCache(
  ...datasets: (Dataset<ScalarShape | ArrayShape> | undefined)[]
): (dimMapping: DimensionMapping) => boolean {
  const { queries, queryClient } = useDataContext();

  const definedDatasets = datasets.filter(isDefined);

  return (nextMapping) => {
    const selection = getSliceSelection(nextMapping);

    return definedDatasets.every((dataset) => {
      const { queryKey } = queries.value(dataset, selection);
      return queryClient.getQueryData(queryKey) !== undefined;
    });
  };
}
