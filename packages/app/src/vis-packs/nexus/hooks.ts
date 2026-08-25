import { type DimensionMapping } from '@h5web/lib';
import {
  type ComplexType,
  type GroupWithChildren,
  type NumericLikeType,
} from '@h5web/shared/hdf5-models';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useValuesInCache } from '../../hooks';
import {
  type DataContextValue,
  useDataContext,
} from '../../providers/DataProvider';
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

export function useNxData(group: GroupWithChildren): NxData {
  const dataContext = useDataContext();

  return useSuspenseQuery({
    queryKey: [dataContext.filepath, 'nxData', group.path],
    queryFn: async () => getNxData(group, dataContext),
  }).data;
}

export async function getNxData(
  group: GroupWithChildren,
  dataContext: DataContextValue,
): Promise<NxData> {
  await assertNxDataGroup(group, dataContext);
  const signalDataset = await findSignalDataset(group, dataContext);
  const axisDatasets = await findAxesDatasets(
    group,
    signalDataset,
    dataContext,
  );
  const auxSignals = await findAuxiliaryDatasets(group, dataContext);

  return {
    titleDataset: findTitleDataset(group),
    signalDef: {
      dataset: signalDataset,
      errorDataset: findErrorDataset(group, signalDataset.name),
      ...(await getFieldInfo(signalDataset, dataContext)),
    },
    auxDefs: await Promise.all(
      auxSignals.map(async (auxSignal) => ({
        dataset: auxSignal,
        errorDataset: findAuxErrorDataset(group, auxSignal.name),
        ...(await getFieldInfo(auxSignal, dataContext)),
      })),
    ),
    axisDefs: await Promise.all(
      axisDatasets.map(
        async (dataset) =>
          dataset && { dataset, ...(await getFieldInfo(dataset, dataContext)) },
      ),
    ),
    defaultSlice: await getDefaultSlice(
      group,
      signalDataset.shape.dims,
      dataContext,
    ),
    silxStyle: await getSilxStyle(group, dataContext),
  };
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
