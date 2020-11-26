import {
  HDF5Collection,
  HDF5Group,
  HDF5Id,
  HDF5Metadata,
  HDF5Value,
} from '../../providers/models';
import {
  assertDataset,
  getLink,
  getLinkedEntity,
  isReachable,
} from '../../providers/utils';
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
  getDatasetLabel,
  getNxAxisNames,
  parseSilxStyleAttribute,
} from './utils';

function useLinkedDatasetValues(
  group: HDF5Group
): Record<HDF5Id, HDF5Value | undefined> {
  const datasetIds = group.links
    ?.filter(isReachable)
    .filter((link) => link.collection === HDF5Collection.Datasets)
    .map((link) => link.id);

  return useDatasetValues(datasetIds || []);
}

export function useNxData(group: HDF5Group, metadata: HDF5Metadata): NxData {
  const values = useLinkedDatasetValues(group);

  const signalName = findSignalName(group);
  const signalDataset = findSignalDataset(signalName, group, metadata);

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

    const axisDataset = getLinkedEntity(axisName, group, metadata);
    assertDefined(axisDataset);
    assertDataset(axisDataset);

    const axisValue = values[axisDataset.id];
    assertOptionalArray<number>(axisValue);

    return {
      value: axisValue,
      label: getDatasetLabel(axisDataset, axisName),
      scaleType: axes_scale_type && axes_scale_type[i],
    };
  });

  const errorsLink =
    getLink(`${signalName}_errors`, group) || getLink('errors', group);
  const errorsValue =
    errorsLink && isReachable(errorsLink) && values[errorsLink.id];
  assertOptionalArray<number>(errorsValue);

  const titleLink = getLink('title', group);
  const titleValue =
    titleLink && isReachable(titleLink) && values[titleLink.id];

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
