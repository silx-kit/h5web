import { isDefined } from '@h5web/shared/guards';
import type { GroupWithChildren } from '@h5web/shared/models-hdf5';

import { useDataContext } from '../../providers/DataProvider';
import type { NxData } from './models';
import {
  assertNxDataGroup,
  findAssociatedDatasets,
  findAuxErrorDataset,
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
  const auxSignals = findAssociatedDatasets(
    group,
    'auxiliary_signals',
    attrValuesStore,
  ).filter(isDefined);

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
