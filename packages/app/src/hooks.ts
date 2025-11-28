import { type DimensionMapping, getSliceSelection } from '@h5web/lib';
import { assertDatasetValue, isDefined } from '@h5web/shared/guards';
import {
  type ArrayShape,
  type Dataset,
  type Entity,
  type ProvidedEntity,
  type ScalarShape,
  type Value,
} from '@h5web/shared/hdf5-models';
import { use } from 'react';

import { useDataContext } from './providers/DataProvider';
import { type AttrName } from './providers/models';
import { hasAttribute } from './utils';

export function useEntity(path: string): ProvidedEntity {
  const { entitiesStore } = useDataContext();
  return use(entitiesStore.get(path));
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
  const value = use(valuesStore.get({ dataset, selection }));

  assertDatasetValue(value, dataset);
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

    const value = use(valuesStore.get({ dataset, selection }));
    assertDatasetValue(value, dataset);
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

export function useAttrValue(entity: Entity, attrName: AttrName): unknown {
  const { attrValuesStore } = useDataContext();

  if (!hasAttribute(entity, attrName)) {
    return undefined;
  }

  const attrValues = use(attrValuesStore.get(entity));
  return attrValues[attrName];
}
