import {
  HDF5Group,
  HDF5Metadata,
  HDF5Dataset,
  HDF5Value,
  HDF5Entity,
} from '../../providers/models';
import { assertGroup, getLinkedEntity, isGroup } from '../../providers/utils';
import {
  NxAttribute,
  NxInterpretation,
  RawSilxStyle,
  SilxStyle,
} from './models';
import {
  assertArray,
  assertDefined,
  assertStr,
  isScaleType,
} from '../shared/utils';

export function getAttributeValue(
  entity: HDF5Dataset | HDF5Group,
  attributeName: NxAttribute
): HDF5Value | undefined {
  return entity.attributes?.find((attr) => attr.name === attributeName)?.value;
}

export function findNxDataGroup(
  group: HDF5Group,
  metadata: HDF5Metadata
): HDF5Group | undefined {
  if (getAttributeValue(group, 'NX_class') === 'NXdata') {
    return group; // `NXdata` group found
  }

  const defaultPath = getAttributeValue(group, 'default');
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
    isAbsolutePath ? metadata.groups[metadata.root] : group
  );

  assertDefined(defaultEntity, `Expected entity at path "${defaultPath}"`);
  assertGroup(defaultEntity, `Expected group at path "${defaultPath}"`);

  return findNxDataGroup(defaultEntity, metadata);
}

export function isNxInterpretation(
  attrValue: HDF5Value
): attrValue is NxInterpretation {
  return (
    typeof attrValue === 'string' &&
    Object.values<string>(NxInterpretation).includes(attrValue)
  );
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
