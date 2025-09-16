import { type DimensionMapping } from '@h5web/lib';
import {
  type ComplexType,
  type GroupWithChildren,
  type NumericLikeType,
} from '@h5web/shared/hdf5-models';

import { useValuesInCache } from '../../hooks';
import { useDataContext } from '../../providers/DataProvider';
import { type DatasetDef, type NxData } from './models';
import {
  assertNxDataGroup,
  findAuxErrorDataset,
  findAuxiliaryDatasets,
  findAxesDatasets,
  findErrorDataset,
  findSignalDataset,
  findTitleDataset,
  getDatasetInfo,
  getDefaultSlice,
  getSilxStyle,
} from './utils';

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
      ...getDatasetInfo(signalDataset, attrValuesStore),
    },
    auxDefs: auxSignals.map((auxSignal) => ({
      dataset: auxSignal,
      errorDataset: findAuxErrorDataset(group, auxSignal.name),
      ...getDatasetInfo(auxSignal, attrValuesStore),
    })),
    axisDefs: axisDatasets.map(
      (dataset) =>
        dataset && { dataset, ...getDatasetInfo(dataset, attrValuesStore) },
    ),
    defaultSlice: getDefaultSlice(group, signalDataset.shape, attrValuesStore),
    silxStyle: getSilxStyle(group, attrValuesStore),
  };
}

export function useNxHeatmapDataToFetch<
  T extends NumericLikeType | ComplexType,
>(nxData: NxData<T>, selectedDef: DatasetDef<T>): NxData<T> {
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
