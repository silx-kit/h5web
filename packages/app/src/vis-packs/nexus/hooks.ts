import type { GroupWithChildren } from '@h5web/shared/hdf5-models';

import type { DimensionMapping } from '../../dimension-mapper/models';
import { useDataContext } from '../../providers/DataProvider';
import { useValuesInCache } from '../core/hooks';
import type { NxData } from './models';
import {
  assertNxDataGroup,
  findAuxErrorDataset,
  findAuxiliaryDatasets,
  findAxesDatasets,
  findErrorDataset,
  findSignalDataset,
  findTitleDataset,
  getDatasetInfo,
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
    silxStyle: getSilxStyle(group, attrValuesStore),
  };
}

export function useNxValuesCached(
  nxData: NxData,
): (dimMapping: DimensionMapping) => boolean {
  const { signalDef, auxDefs } = nxData;

  return useValuesInCache(
    signalDef.dataset,
    signalDef.errorDataset,
    ...auxDefs.flatMap((def) => [def?.dataset, def?.errorDataset]),
  );
}
