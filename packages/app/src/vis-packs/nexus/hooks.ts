import type { GroupWithChildren, ScaleType } from '@h5web/shared';
import { isDefined } from '@h5web/shared';

import { useDataContext } from '../../providers/DataProvider';
import { useDatasetValues } from '../core/hooks';
import type { AxisMapping } from '../core/models';
import type {
  AuxDatasets,
  Auxiliary,
  AxisDatasetMapping,
  NxData,
} from './models';
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
    axisDatasets: findAxesDatasets(group, signalDataset, attrValuesStore),
    titleDataset: findTitleDataset(group),
    silxStyle: getSilxStyle(group, attrValuesStore),
    auxDatasets,
  };
}

export function useAxisMapping(
  mapping: AxisDatasetMapping,
  axisScaleTypes: ScaleType[] | undefined
): AxisMapping {
  const { attrValuesStore } = useDataContext();

  const axisValues = useDatasetValues(mapping.filter(isDefined));

  return mapping.map((dataset, i) => {
    return (
      dataset && {
        label: getDatasetLabel(dataset, attrValuesStore),
        value: axisValues[dataset.name],
        scaleType: axisScaleTypes?.[i],
      }
    );
  });
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
