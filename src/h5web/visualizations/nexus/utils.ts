import type { Group, Entity, Dataset } from '../../providers/models';
import type {
  HDF5Group,
  HDF5Dataset,
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
} from '../../guards';
import { NxAttribute, NxInterpretation, SilxStyle } from './models';
import { isScaleType } from '../shared/utils';
import { getChildEntity, getEntityAtPath } from '../../utils';

export function getAttributeValue(
  entity: HDF5Dataset | HDF5Group | Entity,
  attributeName: NxAttribute
): HDF5Value {
  return entity.attributes?.find((attr) => attr.name === attributeName)?.value;
}

export function findNxDataGroup(group: Group): Group | undefined {
  if (getAttributeValue(group, 'NX_class') === 'NXdata') {
    return group; // `NXdata` group found
  }

  const defaultPath = getAttributeValue(group, 'default');
  if (defaultPath === undefined) {
    return undefined; // group has no `default` attribute
  }

  assertStr(defaultPath, `Expected 'default' attribute to be a string`);

  const defaultEntity = getEntityAtPath(group, defaultPath, false);
  assertDefined(defaultEntity, `Expected entity at path "${defaultPath}"`);
  assertGroup(defaultEntity, `Expected group at path "${defaultPath}"`);

  const nxDataGroup = findNxDataGroup(defaultEntity);
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
  assertNumericType(dataset);
  assertSimpleShape(dataset);

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

    return {
      signalScaleType: isScaleType(signal_scale_type)
        ? signal_scale_type
        : undefined,
      axesScaleType:
        Array.isArray(axes_scale_type) && axes_scale_type.every(isScaleType)
          ? axes_scale_type
          : undefined,
    };
  } catch {
    console.warn(`Malformed 'SILX_style' attribute: ${silxStyle}`); // eslint-disable-line no-console
    return {};
  }
}
