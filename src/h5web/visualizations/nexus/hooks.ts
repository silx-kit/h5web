import {
  HDF5Collection,
  HDF5Group,
  HDF5Id,
  HDF5Metadata,
  HDF5SimpleShape,
} from '../../providers/models';
import {
  assertDataset,
  getEntity,
  isDataset,
  isReachable,
} from '../../providers/utils';
import { useDatasetValues } from '../containers/hooks';
import { assertStr, assertArray, assertOptionalArray } from '../shared/utils';
import { NxData } from './models';
import {
  getAttributeValue,
  getLinkedEntity,
  getDatasetLabel,
  getNxAxisNames,
  parseSilxStyleAttribute,
} from './utils';

export function useLinkedDatasetValues(
  group: HDF5Group,
  metadata: HDF5Metadata
) {
  const datasetLinks =
    group.links?.filter(
      (link) => isReachable(link) && link.collection === HDF5Collection.Datasets
    ) || [];

  const datasetEntries = datasetLinks
    .map((link) => {
      const entity = getEntity(link, metadata);

      return entity && isDataset(entity) ? [link.title, entity.id] : undefined;
    })
    .filter((entry): entry is [string, HDF5Id] => !!entry);

  return useDatasetValues(Object.fromEntries(datasetEntries));
}

export function useNxData(group: HDF5Group, metadata: HDF5Metadata): NxData {
  const datasetValues = useLinkedDatasetValues(group, metadata);

  const signalName = getAttributeValue(group, 'signal');
  assertStr(signalName);
  const signalDataset = getLinkedEntity(signalName, group, metadata);

  if (!signalDataset) {
    throw new Error('Signal dataset not found');
  }
  assertDataset(signalDataset);

  const signalValue = datasetValues && datasetValues[signalName];
  if (!signalValue) {
    return {
      signal: {
        dims: (signalDataset.shape as HDF5SimpleShape).dims,
      },
    };
  }
  assertArray<number>(signalValue);

  const axesNames = getNxAxisNames(group);

  const silxStyle = parseSilxStyleAttribute(group);
  const { axes_scale_type, signal_scale_type } = silxStyle;

  const axisMapping = axesNames.map((name, i) => {
    if (!name) {
      return undefined;
    }

    const dataset = getLinkedEntity(name, group, metadata);
    if (!dataset) {
      return undefined;
    }
    assertDataset(dataset);

    const value = datasetValues && datasetValues[name];
    assertOptionalArray<number>(value);

    return {
      value,
      label: getDatasetLabel(dataset, name),
      scaleType: axes_scale_type && axes_scale_type[i],
    };
  });

  const errors = datasetValues && datasetValues.errors;
  assertOptionalArray<number>(errors);

  return {
    signal: {
      label: getDatasetLabel(signalDataset, signalName),
      value: signalValue,
      dims: (signalDataset.shape as HDF5SimpleShape).dims,
      scaleType: signal_scale_type,
    },
    errors,
    title:
      datasetValues && typeof datasetValues.title === 'string'
        ? datasetValues.title
        : undefined,
    axisMapping,
  };
}
