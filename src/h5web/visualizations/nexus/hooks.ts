import { MyHDF5Group } from '../../providers/models';
import { assertMyDataset, isMyDataset } from '../../providers/utils';
import { useDatasetValues } from '../containers/hooks';
import {
  assertArray,
  assertDefined,
  assertOptionalArray,
} from '../shared/utils';
import type { NxData } from './models';
import {
  findMySignalDataset,
  findSignalName,
  getChildEntity,
  getDatasetLabel,
  getNxAxisNames,
  parseSilxStyleAttribute,
} from './utils';

export function useNxData(group: MyHDF5Group): NxData {
  const values = useDatasetValues(
    group.children.filter(isMyDataset).map((child) => child.id)
  );

  const signalName = findSignalName(group);
  const signalDataset = findMySignalDataset(group, signalName);

  const signalValue = values[signalDataset.id];
  if (!signalValue) {
    return { signal: { dims: signalDataset.shape.dims } };
  }

  assertArray<number>(signalValue);
  const axesNames = getNxAxisNames(group);

  const silxStyle = parseSilxStyleAttribute(group);
  const { axes_scale_type, signal_scale_type } = silxStyle;

  const axisMapping = axesNames.map((axisName, i) => {
    if (!axisName) {
      return undefined;
    }

    const axisDataset = getChildEntity(group, axisName);
    assertDefined(axisDataset);
    assertMyDataset(axisDataset);

    const axisValue = values[axisDataset.id];
    assertOptionalArray<number>(axisValue);

    return {
      value: axisValue,
      label: getDatasetLabel(axisDataset, axisName),
      scaleType: axes_scale_type && axes_scale_type[i],
    };
  });

  const errorsDataset =
    getChildEntity(group, `${signalName}_errors`) ||
    getChildEntity(group, 'errors');
  const errorsValue =
    errorsDataset && isMyDataset(errorsDataset) && values[errorsDataset.id];
  assertOptionalArray<number>(errorsValue);

  const titleDataset = getChildEntity(group, 'title');
  const titleValue =
    titleDataset && isMyDataset(titleDataset) && values[titleDataset.id];

  return {
    signal: {
      label: getDatasetLabel(signalDataset, signalName),
      value: signalValue,
      dims: signalDataset.shape.dims,
      scaleType: signal_scale_type,
    },
    errors: errorsValue,
    title: typeof titleValue === 'string' ? titleValue : undefined,
    axisMapping,
  };
}
