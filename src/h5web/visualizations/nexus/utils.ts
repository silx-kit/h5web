import type {
  HDF5Group,
  HDF5Metadata,
  HDF5Dataset,
  HDF5Value,
  HDF5Entity,
} from '../../providers/models';
import { getEntity, isDataset, isGroup } from '../../providers/utils';
import { NxAttribute, NX_INTERPRETATIONS } from './models';
import { assertArray, assertOptionalArray } from '../shared/utils';
import { AxisParams } from '../shared/models';

export function isNxDataGroup(group: HDF5Group): boolean {
  return !!group.attributes?.find(({ value }) => value === 'NXdata');
}

export function isNxInterpretation(attrValue: HDF5Value): boolean {
  return (
    attrValue &&
    typeof attrValue === 'string' &&
    NX_INTERPRETATIONS.includes(attrValue)
  );
}

export function getAttributeValue(
  entity: HDF5Dataset | HDF5Group,
  attributeName: NxAttribute
): HDF5Value | undefined {
  if (!entity.attributes) {
    return undefined;
  }

  return entity.attributes.find((attr) => attr.name === attributeName)?.value;
}

export function getLinkedEntity(
  entityName: string,
  group: HDF5Group,
  metadata: HDF5Metadata
): HDF5Entity | undefined {
  const childLink = group.links?.find((l) => l.title === entityName);

  return getEntity(childLink, metadata);
}

export function getNxAxisMapping(group: HDF5Group) {
  const axisList = getAttributeValue(group, 'axes');

  if (!axisList) {
    return [];
  }

  const axisMapping = typeof axisList === 'string' ? [axisList] : axisList;
  assertArray<string>(axisMapping);
  return axisMapping.map((a) => (a !== '.' ? a : undefined));
}

export function getNxDataGroup(
  entity: HDF5Entity | undefined,
  metadata: HDF5Metadata
): HDF5Group | undefined {
  if (!entity || !isGroup(entity)) {
    return undefined;
  }

  if (isNxDataGroup(entity)) {
    return entity;
  }

  const defaultPath = getAttributeValue(entity, 'default');

  if (typeof defaultPath !== 'string') {
    return undefined;
  }

  const relativePath = defaultPath.startsWith('/')
    ? defaultPath.slice(1)
    : defaultPath;

  const defaultEntity = relativePath.split('/').reduce<HDF5Entity | undefined>(
    (previousEntity, currentComponent) => {
      if (!previousEntity || !isGroup(previousEntity)) {
        return undefined;
      }
      return getLinkedEntity(currentComponent, previousEntity, metadata);
    },
    defaultPath.startsWith('/') ? metadata.groups[metadata.root] : entity
  );

  return getNxDataGroup(defaultEntity, metadata);
}

export function getDatasetLabel(
  dataset: HDF5Dataset,
  datasetName: string
): string {
  const longName = getAttributeValue(dataset, 'long_name');
  if (longName && typeof longName === 'string') {
    return longName;
  }

  const units = getAttributeValue(dataset, 'units');
  if (units && typeof units === 'string') {
    return `${datasetName} (${units})`;
  }

  return datasetName;
}

export function getLinkedDatasets(
  names: string[],
  nxDataGroup: HDF5Group,
  metadata: HDF5Metadata
): Map<string, HDF5Dataset> {
  const datasetEntries = names
    .map<[string, HDF5Entity | undefined]>((name) => {
      return [name, getLinkedEntity(name, nxDataGroup, metadata)];
    })
    .filter((entry): entry is [string, HDF5Dataset] => {
      const [, dataset] = entry;
      return !!dataset && isDataset(dataset);
    });

  return new Map(datasetEntries);
}

export function getNxAxesParams(
  nxDatasets: Map<string, HDF5Dataset>,
  axisValues: (HDF5Value | undefined)[]
): Record<string, AxisParams> {
  const paramsEntries = Object.entries(nxDatasets).map(([axis, dataset], i) => {
    const values = axisValues[i];
    assertOptionalArray<number>(values);
    return [axis, { values, label: getDatasetLabel(dataset, axis) }];
  });

  return Object.fromEntries(paramsEntries);
}
