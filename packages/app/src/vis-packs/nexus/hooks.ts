import type {
  AxisMapping,
  GroupWithChildren,
  NumArray,
  NumArrayDataset,
} from '@h5web/shared';
import { isDefined } from '@h5web/shared';

import { useDataContext } from '../../providers/DataProvider';
import { useDatasetValues } from '../core/hooks';
import type { AuxDatasets, Auxiliary, NxData } from './models';
import {
  assertNxDataGroup,
  findAssociatedDatasets,
  findAxesDatasets,
  findErrorDataset,
  findSignalDataset,
  findAuxErrorDataset,
  findTitleDataset,
  getDatasetLabel,
  getSilxStyle,
} from './utils';

export function useNxData(group: GroupWithChildren): NxData {
  const { attrValuesStore } = useDataContext();

  assertNxDataGroup(group, attrValuesStore);
  const signalDataset = findSignalDataset(group, attrValuesStore);
  const errorDataset = findErrorDataset(group, signalDataset.name);
  const axisDatasets = findAxesDatasets(group, signalDataset, attrValuesStore);
  const auxSignals = findAssociatedDatasets(
    group,
    'auxiliary_signals',
    attrValuesStore
  ).filter(isDefined);
  const auxDatasets = auxSignals.map((auxSignal) => ({
    signal: auxSignal,
    errors: findAuxErrorDataset(group, auxSignal.name),
  }));

  return {
    signalDataset,
    errorDataset,
    axisDatasets,
    axisLabels: axisDatasets.map(
      (dataset) => dataset && getDatasetLabel(dataset, attrValuesStore)
    ),
    titleDataset: findTitleDataset(group),
    silxStyle: getSilxStyle(group, attrValuesStore),
    auxDatasets,
  };
}

export function useAxisValues(
  axisDatasets: AxisMapping<NumArrayDataset>
): AxisMapping<NumArray> {
  const axisValues = useDatasetValues(axisDatasets.filter(isDefined));
  return axisDatasets.map((dataset) => dataset && axisValues[dataset.name]);
}

export function useAuxiliaries(
  auxDatasets: AuxDatasets,
  selection: string | undefined
): Auxiliary[] {
  const { attrValuesStore } = useDataContext();

  const auxValues = useDatasetValues(
    [
      ...auxDatasets.map((d) => d.signal),
      ...auxDatasets.map((d) => d.errors).filter(isDefined),
    ],
    selection
  );

  return auxDatasets.map(({ signal, errors }) => ({
    label: getDatasetLabel(signal, attrValuesStore),
    values: auxValues[signal.name],
    errors: errors ? auxValues[errors.name] : undefined,
  }));
}
