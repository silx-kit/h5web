import { Group } from '../../providers/models';
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
  findSignalDataset,
  getDatasetLabel,
  getNxAxisNames,
  parseSilxStyleAttribute,
} from './utils';
import { getChildEntity } from '../../utils';

export function useNxData(group: Group): NxData {
  const values = useDatasetValues(group.children.filter(isDataset));

  const signalDataset = findSignalDataset(group);
  const signalValue = values[signalDataset.name];
  if (!signalValue) {
    return { signal: { dims: signalDataset.shape.dims } };
  }

  assertArray<number>(signalValue);

  const silxStyle = parseSilxStyleAttribute(group);
  const { axesScaleType, signalScaleType } = silxStyle;

  const axesNames = getNxAxisNames(group);
  const axisMapping = axesNames.map((axisName, i) => {
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
