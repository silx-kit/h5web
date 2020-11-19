import {
  HDF5Group,
  HDF5Metadata,
  HDF5Dataset,
  HDF5Value,
  HDF5Entity,
} from '../../providers/models';
import { getEntity, isGroup } from '../../providers/utils';
import {
  NxAttribute,
  NX_INTERPRETATIONS,
  RawSilxStyle,
  SilxStyle,
} from './models';
import { assertArray, assertStr, isScaleType } from '../shared/utils';

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

export function getNxAxisNames(group: HDF5Group): (string | undefined)[] {
  const axisList = getAttributeValue(group, 'axes');

  if (!axisList) {
    return [];
  }

  const axisNames = typeof axisList === 'string' ? [axisList] : axisList;
  assertArray<string>(axisNames);
  return axisNames.map((a) => (a !== '.' ? a : undefined));
}

export function getNxDataGroup(
  entity: HDF5Entity | undefined,
  metadata: HDF5Metadata
): HDF5Group | undefined {
  if (!entity || !isGroup(entity)) {
    return undefined;
  }

  if (getAttributeValue(entity, 'NX_class') === 'NXdata') {
    return entity; // `NXdata` group found
  }

  const defaultPath = getAttributeValue(entity, 'default');
  if (defaultPath === undefined) {
    return undefined; // group has no `default` attribute
  }

  assertStr(defaultPath, `Expected 'default' attribute to be a string`);

  const isAbsolutePath = defaultPath.startsWith('/');
  const pathSegments = defaultPath.slice(isAbsolutePath ? 1 : 0).split('/');

  const defaultEntity = pathSegments.reduce<HDF5Entity | undefined>(
    (parentEntity, currSegment) => {
      return parentEntity && isGroup(parentEntity)
        ? getLinkedEntity(currSegment, parentEntity, metadata)
        : undefined;
    },
    isAbsolutePath ? metadata.groups[metadata.root] : entity
  );

  const nxDataGroup = getNxDataGroup(defaultEntity, metadata);
  if (!nxDataGroup) {
    throw new Error(`Expected to find NXdata group at path "${defaultPath}"`);
  }

  return nxDataGroup;
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

export function parseSilxStyleAttribute(group: HDF5Group): SilxStyle {
  const silxStyle = getAttributeValue(group, 'SILX_style');

  if (!silxStyle || typeof silxStyle !== 'string') {
    return {};
  }

  const rawSilxStyle: RawSilxStyle = JSON.parse(silxStyle);
  const { axes_scale_type, signal_scale_type } = rawSilxStyle;

  return {
    signal_scale_type: isScaleType(signal_scale_type)
      ? signal_scale_type
      : undefined,
    axes_scale_type:
      Array.isArray(axes_scale_type) && axes_scale_type.every(isScaleType)
        ? axes_scale_type
        : undefined,
  };
}
