import type {
  HDF5Group,
  HDF5Metadata,
  HDF5Dataset,
  HDF5Value,
  HDF5Entity,
} from '../../providers/models';
import { getEntity, isDataset } from '../../providers/utils';
import { NxAttribute, NX_INTERPRETATIONS } from './models';
import { assertArray, assertStr } from '../shared/utils';

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
  group: HDF5Group,
  metadata: HDF5Metadata,
  entityName: string
): HDF5Entity | undefined {
  const childLink = group.links?.find((l) => l.title === entityName);

  return getEntity(childLink, metadata);
}

export function getSignalDataset(
  group: HDF5Group,
  metadata: HDF5Metadata
): HDF5Dataset | undefined {
  const signal = getAttributeValue(group, 'signal');
  if (!signal) {
    return undefined;
  }

  assertStr(signal);
  const signalDataset = getLinkedEntity(group, metadata, signal);

  return signalDataset && isDataset(signalDataset) ? signalDataset : undefined;
}

export function getAxesLabels(group: HDF5Group): Array<string | undefined> {
  const axesList = getAttributeValue(group, 'axes');

  if (!axesList) {
    return [];
  }

  const axes = typeof axesList === 'string' ? [axesList] : axesList;
  assertArray<string>(axes);

  return axes.map((a) => (a === '.' ? undefined : a));
}
