import { type DimensionMapping } from '@h5web/lib';
import { createMemo } from '@h5web/shared/createMemo';
import { assertValue, isDefined } from '@h5web/shared/guards';
import {
  type ArrayShape,
  type ComplexType,
  type Dataset,
  type GroupWithChildren,
  type NumericLikeType,
  type ScalarShape,
  type Value,
} from '@h5web/shared/hdf5-models';

import { useValuesInCache } from '../../hooks';
import { useDataContext } from '../../providers/DataProvider';
import { type FieldDef, type NxData } from './models';
import {
  assertNxDataGroup,
  findAuxErrorDataset,
  findAuxiliaryDatasets,
  findAxesDatasets,
  findErrorDataset,
  findSignalDataset,
  findTitleDataset,
  getDefaultSlice,
  getFieldInfo,
  getSilxStyle,
} from './utils';

export const useDefaultSlice = createMemo(getDefaultSlice);

export function useNxData(group: GroupWithChildren): NxData {
  const { attrValuesStore } = useDataContext();

  assertNxDataGroup(group, attrValuesStore);
  const signalDataset = findSignalDataset(group, attrValuesStore);
  const axisDatasets = findAxesDatasets(group, signalDataset, attrValuesStore);
  const auxSignals = findAuxiliaryDatasets(group, attrValuesStore);

  return {
    titleDataset: findTitleDataset(group),
    signalDef: {
      dataset: signalDataset,
      errorDataset: findErrorDataset(group, signalDataset.name),
      ...getFieldInfo(signalDataset, attrValuesStore),
    },
    auxDefs: auxSignals.map((auxSignal) => ({
      dataset: auxSignal,
      errorDataset: findAuxErrorDataset(group, auxSignal.name),
      ...getFieldInfo(auxSignal, attrValuesStore),
    })),
    axisDefs: axisDatasets.map(
      (dataset) =>
        dataset && { dataset, ...getFieldInfo(dataset, attrValuesStore) },
    ),
    defaultSlice: useDefaultSlice(
      group,
      signalDataset.shape.dims,
      attrValuesStore,
    ),
    silxStyle: getSilxStyle(group, attrValuesStore),
  };
}

export function usePrefetchNxValues(
  datasets: (Dataset<ScalarShape | ArrayShape> | undefined)[],
  selection?: string,
): void {
  const { valuesStore } = useDataContext();
  datasets.filter(isDefined).forEach((dataset) => {
    valuesStore.prefetch({ dataset, selection });
  });
}

export function useNxValues<D extends Dataset<ArrayShape | ScalarShape>>(
  datasets: D[],
  selection?: string,
): Value<D>[];

export function useNxValues<D extends Dataset<ArrayShape | ScalarShape>>(
  datasets: (D | undefined)[],
  selection?: string,
): (Value<D> | undefined)[];

export function useNxValues<D extends Dataset<ArrayShape | ScalarShape>>(
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

export function useNxHeatmapDataToFetch<
  T extends NumericLikeType | ComplexType,
>(nxData: NxData<T>, selectedDef: FieldDef<T>): NxData<T> {
  const { signalDef, titleDataset } = nxData;

  return {
    ...nxData,
    signalDef: selectedDef,
    auxDefs: [], // fetch selected signal only
    titleDataset:
      selectedDef.dataset === signalDef.dataset
        ? titleDataset
        : // when auxiliary signal is selected, don't fetch title dataset (i.e. use the auxiliary's label as title)
          undefined,
  };
}

export function useNxValuesCached(
  nxData: NxData,
): (dimMapping: DimensionMapping) => boolean {
  const { signalDef, auxDefs } = nxData;

  return useValuesInCache(
    signalDef.dataset,
    signalDef.errorDataset,
    ...auxDefs.flatMap((def) => [def.dataset, def.errorDataset]),
  );
}
