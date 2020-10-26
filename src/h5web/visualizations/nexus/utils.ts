import type {
  HDF5Group,
  HDF5Metadata,
  HDF5Dataset,
  HDF5Value,
  HDF5Entity,
  HDF5Id,
} from '../../providers/models';
import { getEntity, isDataset } from '../../providers/utils';
import { NxAttribute, NX_INTERPRETATIONS } from './models';
import { assertArray } from '../shared/utils';

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

export function getNxAxes(
  group: HDF5Group,
  metadata: HDF5Metadata
): { labels: Array<string | undefined>; ids: Record<string, HDF5Id> } {
  const axesList = getAttributeValue(group, 'axes');

  if (!axesList) {
    return { labels: [], ids: {} };
  }

  const axes = typeof axesList === 'string' ? [axesList] : axesList;
  assertArray<string>(axes);

  const axesLabels = axes.map((a) => (a === '.' ? undefined : a));
  const axesIds = axesLabels.reduce<Record<string, HDF5Id>>((acc, axis) => {
    if (!axis) {
      return acc;
    }

    const dataset = getLinkedEntity(group, metadata, axis);
    if (dataset && isDataset(dataset)) {
      acc[axis] = dataset.id;
    }
    return acc;
  }, {});

  return { labels: axesLabels, ids: axesIds };
}
