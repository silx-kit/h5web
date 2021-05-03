import { useContext } from 'react';
import type {
  Dataset,
  Group,
  NumArrayDataset,
  ScalarShape,
  StringType,
} from '../../providers/models';
import { ProviderContext } from '../../providers/context';
import {
  isDefined,
  assertArray,
  assertDefined,
  assertDataset,
  assertNumericType,
  assertArrayShape,
  assertStringType,
  assertScalarShape,
} from '../../guards';
import { getChildEntity } from '../../utils';
import type { AxisMapping, ScaleType } from '../core/models';
import { useDatasetValues } from '../core/hooks';
import type { AxisDatasetMapping, NxData } from './models';
import {
  assertNxDataGroup,
  findSignalDataset,
  getDatasetLabel,
  getAttributeValue,
  getSilxStyle,
  findErrorsDataset,
} from './utils';

function useTitleDataset(
  group: Group
): Dataset<ScalarShape, StringType> | undefined {
  const { valuesStore } = useContext(ProviderContext);

  const dataset = getChildEntity(group, 'title');
  if (!dataset) {
    return undefined;
  }

  assertDataset(dataset);
  assertScalarShape(dataset);
  assertStringType(dataset);

  valuesStore.prefetch({ path: dataset.path });
  return dataset;
}

function useAssociatedDatasets(
  group: Group,
  type: 'axes' | 'auxiliary_signals'
): (NumArrayDataset | undefined)[] {
  const { valuesStore } = useContext(ProviderContext);

  const dsetList = getAttributeValue(group, type) || [];
  const dsetNames = typeof dsetList === 'string' ? [dsetList] : dsetList;
  assertArray<string>(dsetNames);

  return dsetNames.map((name) => {
    if (name === '.') {
      return undefined;
    }

    const dataset = getChildEntity(group, name);
    assertDefined(dataset);
    assertDataset(dataset);
    assertArrayShape(dataset);
    assertNumericType(dataset);

    valuesStore.prefetch({ path: dataset.path });
    return dataset;
  });
}

export function useNxData(group: Group): NxData {
  assertNxDataGroup(group);
  const signalDataset = findSignalDataset(group);

  return {
    signalDataset,
    errorsDataset: findErrorsDataset(group, signalDataset.name),
    titleDataset: useTitleDataset(group),
    axisDatasets: useAssociatedDatasets(group, 'axes'),
    silxStyle: getSilxStyle(group),
    auxDatasets: useAssociatedDatasets(group, 'auxiliary_signals').filter(
      isDefined
    ),
  };
}

export function useAxisMapping(
  mapping: AxisDatasetMapping,
  axisScaleTypes: ScaleType[] | undefined
): AxisMapping {
  const axisValues = useDatasetValues(mapping.filter(isDefined));

  return mapping.map((dataset, i) => {
    return (
      dataset && {
        label: getDatasetLabel(dataset),
        value: axisValues[dataset.name],
        scaleType: axisScaleTypes && axisScaleTypes[i],
      }
    );
  });
}
