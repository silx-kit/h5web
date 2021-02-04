import { useContext } from 'react';
import type { Dataset, Group } from '../../providers/models';
import { ProviderContext } from '../../providers/context';
import type {
  HDF5NumericType,
  HDF5SimpleShape,
  HDF5StringType,
  HDF5ScalarShape,
} from '../../providers/hdf5-models';
import {
  isDefined,
  assertArray,
  assertDefined,
  assertDataset,
  assertNumericType,
  assertSimpleShape,
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
): Dataset<HDF5ScalarShape, HDF5StringType> | undefined {
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

function useAxesDatasets(
  group: Group
): (Dataset<HDF5SimpleShape, HDF5NumericType> | undefined)[] {
  const { valuesStore } = useContext(ProviderContext);

  const axisList = getAttributeValue(group, 'axes') || [];
  const axisNames = typeof axisList === 'string' ? [axisList] : axisList;
  assertArray<string>(axisNames);

  return axisNames.map((name) => {
    if (name === '.') {
      return undefined;
    }

    const dataset = getChildEntity(group, name);
    assertDefined(dataset);
    assertDataset(dataset);
    assertSimpleShape(dataset);
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
    axisDatasetMapping: useAxesDatasets(group),
    silxStyle: getSilxStyle(group),
  };
}

export function useAxisMapping(
  mapping: AxisDatasetMapping,
  axesScaleType: ScaleType[] | undefined
): AxisMapping {
  const axisValues = useDatasetValues(mapping.filter(isDefined));

  return mapping.map((dataset, i) => {
    return (
      dataset && {
        label: getDatasetLabel(dataset),
        value: axisValues[dataset.name],
        scaleType: axesScaleType && axesScaleType[i],
      }
    );
  });
}
