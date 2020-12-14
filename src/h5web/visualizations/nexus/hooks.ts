import { MyHDF5Group } from '../../providers/models';
import { assertDataset, isDataset } from '../../providers/utils';
import { useDatasetValues } from '../containers/hooks';
import {
  assertArray,
  assertDefined,
  assertOptionalArray,
} from '../shared/utils';
import type { NxData } from './models';
import {
  findSignalDataset,
  findSignalName,
  getChildEntity,
  getDatasetLabel,
  getNxAxisNames,
  parseSilxStyleAttribute,
} from './utils';

export function useNxData(group: MyHDF5Group): NxData {
  const values = useDatasetValues(
    group.children.filter(isDataset).map((child) => child.id)
  );

  const signalName = findSignalName(group);
  const signalDataset = findSignalDataset(group, signalName);

  const signalValue = values[signalDataset.id];
  if (!signalValue) {
    return { signal: { dims: signalDataset.shape.dims } };
  }

  assertArray<number>(signalValue);
  const axesNames = getNxAxisNames(group);

  const silxStyle = parseSilxStyleAttribute(group);
  const { axesScaleType, signalScaleType } = silxStyle;

  const axisMapping = axesNames.map((axisName, i) => {
    if (!axisName) {
      return undefined;
    }

    const axisDataset = getChildEntity(group, axisName);
    assertDefined(axisDataset);
    assertDataset(axisDataset);

    const axisValue = values[axisDataset.id];
    assertOptionalArray<number>(axisValue);

    return {
      value: axisValue,
      label: getDatasetLabel(axisDataset, axisName),
      scaleType: axesScaleType && axesScaleType[i],
    };
  });

  const errorsDataset =
    getChildEntity(group, `${signalName}_errors`) ||
    getChildEntity(group, 'errors');
  const errorsValue =
    errorsDataset && isDataset(errorsDataset) && values[errorsDataset.id];
  assertOptionalArray<number>(errorsValue);

  const titleDataset = getChildEntity(group, 'title');
  const titleValue =
    titleDataset && isDataset(titleDataset) && values[titleDataset.id];

  return {
    signal: {
      label: getDatasetLabel(signalDataset, signalName),
      value: signalValue,
      dims: signalDataset.shape.dims,
      scaleType: signalScaleType,
    },
    errors: errorsValue,
    title: typeof titleValue === 'string' ? titleValue : undefined,
    axisMapping,
  };
}
