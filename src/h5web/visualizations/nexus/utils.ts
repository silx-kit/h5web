import type { Group, Entity, Dataset, Metadata } from '../../providers/models';
import type {
  HDF5Value,
  HDF5NumericType,
  HDF5SimpleShape,
} from '../../providers/hdf5-models';
import {
  assertArray,
  assertDefined,
  assertStr,
  assertGroup,
  assertDataset,
  assertNumericType,
  assertSimpleShape,
  isAbsolutePath,
} from '../../guards';
import { NxAttribute, NxInterpretation, SilxStyle } from './models';
import { isScaleType } from '../shared/utils';
import { buildEntityPath, getChildEntity, getEntityAtPath } from '../../utils';

export function getAttributeValue(
  entity: Entity,
  attributeName: NxAttribute
): HDF5Value {
  return entity.attributes?.find((attr) => attr.name === attributeName)?.value;
}

export function findNxDataGroup(
  group: Group,
  metadata: Metadata
): Group | undefined {
  if (getAttributeValue(group, 'NX_class') === 'NXdata') {
    return group; // `NXdata` group found
  }

  const defaultPath = getAttributeValue(group, 'default');
  if (defaultPath === undefined) {
    return undefined; // group has no `default` attribute
  }

  assertStr(defaultPath, `Expected 'default' attribute to be a string`);

  const path = isAbsolutePath(defaultPath)
    ? defaultPath
    : buildEntityPath(group.path, defaultPath);

  const defaultEntity = getEntityAtPath(metadata, path, false);
  assertDefined(defaultEntity, `Expected entity at path "${defaultPath}"`);
  assertGroup(defaultEntity, `Expected group at path "${defaultPath}"`);

  const nxDataGroup = findNxDataGroup(defaultEntity, metadata);
  assertDefined(
    nxDataGroup,
    `Expected NXdata group, or group with 'default' attribute`
  );

  return nxDataGroup;
}

export function findSignalDataset(
  group: Group
): Dataset<HDF5SimpleShape, HDF5NumericType> {
  const signal = getAttributeValue(group, 'signal');
  assertDefined(signal, "Expected 'signal' attribute");
  assertStr(signal, "Expected 'signal' attribute to be a string");

  const dataset = getChildEntity(group, signal);
  assertDefined(dataset, `Expected "${signal}" signal entity to exist`);
  assertDataset(dataset, `Expected "${signal}" signal to be a dataset`);
  assertSimpleShape(dataset);
  assertNumericType(dataset);

  return dataset;
}

export function isNxInterpretation(
  attrValue: HDF5Value
): attrValue is NxInterpretation {
  return (
    typeof attrValue === 'string' &&
    Object.values<string>(NxInterpretation).includes(attrValue)
  );
}

export function getNxAxes(group: Group): string[] {
  const axisList = getAttributeValue(group, 'axes');
  if (!axisList) {
    return [];
  }

  const axisNames = typeof axisList === 'string' ? [axisList] : axisList;
  assertArray<string>(axisNames);

  return axisNames;
}

export function getDatasetLabel(dataset: Dataset): string {
  const longName = getAttributeValue(dataset, 'long_name');
  if (longName && typeof longName === 'string') {
    return longName;
  }

  const units = getAttributeValue(dataset, 'units');
  if (units && typeof units === 'string') {
    return `${dataset.name} (${units})`;
  }

  return dataset.name;
}

export function getSilxStyle(group: Group): SilxStyle {
  const silxStyle = getAttributeValue(group, 'SILX_style');

  if (!silxStyle || typeof silxStyle !== 'string') {
    return {};
  }

  try {
    const rawSilxStyle = JSON.parse(silxStyle);
    const { axes_scale_type, signal_scale_type } = rawSilxStyle;

    const axesScaleType =
      typeof axes_scale_type === 'string' ? [axes_scale_type] : axes_scale_type;

    return {
      signalScaleType: isScaleType(signal_scale_type)
        ? signal_scale_type
        : undefined,
      axesScaleType:
        Array.isArray(axesScaleType) && axesScaleType.every(isScaleType)
          ? axesScaleType
          : undefined,
    };
  } catch {
    console.warn(`Malformed 'SILX_style' attribute: ${silxStyle}`); // eslint-disable-line no-console
    return {};
  }
}
