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

import { useDataContext } from './providers/DataProvider';

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

  assertValue(value, dataset);
  return value;
}

export function useDatasetsValues<D extends Dataset<ArrayShape | ScalarShape>>(
  datasets: D[],
  selection?: string,
): Value<D>[];

export function useDatasetsValues<D extends Dataset<ArrayShape | ScalarShape>>(
  datasets: (D | undefined)[],
  selection?: string,
): (Value<D> | undefined)[];

export function useDatasetsValues<D extends Dataset<ArrayShape | ScalarShape>>(
  datasets: (D | undefined)[],
  selection?: string,
): (Value<D> | undefined)[] {
  const { valuesStore } = useDataContext();

  return datasets.map((dataset) => {
    if (!dataset) {
      return undefined;
    }

    const value = valuesStore.get({ dataset, selection });
    assertValue(value, dataset);
    return value;
  });
}

export function useValuesInCache(
  ...datasets: (Dataset<ScalarShape | ArrayShape> | undefined)[]
): (dimMapping: DimensionMapping) => boolean {
  const { valuesStore } = useDataContext();
  return (nextMapping) => {
    const selection = getSliceSelection(nextMapping);
    return datasets.every(
      (dataset) => !dataset || valuesStore.has({ dataset, selection }),
    );
  };
}
