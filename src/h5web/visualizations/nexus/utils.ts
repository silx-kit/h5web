import type {
  HDF5Group,
  HDF5Metadata,
  HDF5Dataset,
  HDF5Value,
} from '../../providers/models';
import { getEntity, isDataset } from '../../providers/utils';
import { NxAttribute, NX_INTERPRETATIONS } from './models';

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

export function getSignalDataset(
  group: HDF5Group,
  metadata: HDF5Metadata
): HDF5Dataset | undefined {
  const signal = getAttributeValue(group, 'signal');
  const signalLink = signal && group.links?.find((l) => l.title === signal);

  const signalDataset = getEntity(signalLink, metadata);
  return signalDataset && isDataset(signalDataset) ? signalDataset : undefined;
}
