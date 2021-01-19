import type { Group } from '../../providers/models';
import { useDatasetValues } from '../containers/hooks';
import {
  assertArray,
  assertDefined,
  assertOptionalArray,
  assertDataset,
  isDataset,
  assertOptionalStr,
} from '../../guards';
import type { NxData } from './models';
import {
  assertNxDataGroup,
  findSignalDataset,
  getDatasetLabel,
  getNxAxes,
  getSilxStyle,
} from './utils';
import { getChildEntity } from '../../utils';

export function useNxData(group: Group): NxData {
  assertNxDataGroup(group);

  const values = useDatasetValues(group.children.filter(isDataset));

  const signalDataset = findSignalDataset(group);
  const signalValue = values[signalDataset.name];
  assertArray<number>(signalValue);

  const silxStyle = getSilxStyle(group);
  const { axesScaleType, signalScaleType } = silxStyle;

  const axisMapping = getNxAxes(group).map((axisName, i) => {
    if (axisName === '.') {
      return undefined;
    }

    const axisDataset = getChildEntity(group, axisName);
    assertDefined(axisDataset);
    assertDataset(axisDataset);

    const axisValue = values[axisName];
    assertArray<number>(axisValue);

    return {
      value: axisValue,
      label: getDatasetLabel(axisDataset),
      scaleType: axesScaleType && axesScaleType[i],
    };
  });

  const errorsValue = values[`${signalDataset.name}_errors`] || values.errors;
  assertOptionalArray<number>(errorsValue);

  const titleValue = values.title;
  assertOptionalStr(titleValue);

  return {
    signal: {
      label: getDatasetLabel(signalDataset),
      value: signalValue,
      dims: signalDataset.shape.dims,
      scaleType: signalScaleType,
    },
    errors: errorsValue,
    title: titleValue,
    axisMapping,
  };
}
