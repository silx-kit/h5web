import { type DimensionMapping } from '@h5web/lib';
import {
  type ComplexType,
  type GroupWithChildren,
  type NumericLikeType,
} from '@h5web/shared/hdf5-models';
import memoizee from 'memoizee';

import { useValuesInCache } from '../../hooks';
import { type AttrValuesStore } from '../../providers/models';
import { type DatasetDef, type NxData } from './models';
import {
  findAuxErrorDataset,
  findAuxiliaryDatasets,
  findAxesDatasets,
  findDatasetInfo,
  findDefaultSlice,
  findSignalDataset,
  findSilxStyle,
  getErrorDataset,
  getTitleDataset,
  isNxDataGroup,
} from './utils';

export const findNxData = memoizee(_findNxData, { promise: true });
async function _findNxData(
  group: GroupWithChildren,
  attrValuesStore: AttrValuesStore,
): Promise<NxData> {
  if (!(await isNxDataGroup(group, attrValuesStore))) {
    throw new Error('Expected NXdata group');
  }

  const signalDataset = await findSignalDataset(group, attrValuesStore);
  const axisDatasets = await findAxesDatasets(
    group,
    signalDataset,
    attrValuesStore,
  );
  const auxSignals = await findAuxiliaryDatasets(group, attrValuesStore);

  return {
    titleDataset: getTitleDataset(group),
    signalDef: {
      dataset: signalDataset,
      errorDataset: getErrorDataset(group, signalDataset.name),
      ...(await findDatasetInfo(signalDataset, attrValuesStore)),
    },
    auxDefs: await Promise.all(
      auxSignals.map(async (auxSignal) => ({
        dataset: auxSignal,
        errorDataset: findAuxErrorDataset(group, auxSignal.name),
        ...(await findDatasetInfo(auxSignal, attrValuesStore)),
      })),
    ),
    axisDefs: await Promise.all(
      axisDatasets.map(
        async (dataset) =>
          dataset && {
            dataset,
            ...(await findDatasetInfo(dataset, attrValuesStore)),
          },
      ),
    ),
    defaultSlice: await findDefaultSlice(
      group,
      signalDataset.shape,
      attrValuesStore,
    ),
    silxStyle: await findSilxStyle(group, attrValuesStore),
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
