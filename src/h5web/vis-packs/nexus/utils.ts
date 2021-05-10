import type {
  Group,
  Entity,
  Dataset,
  NumArrayDataset,
  NumericType,
  ArrayShape,
  ComplexType,
} from '../../providers/models';
import {
  assertDefined,
  assertStr,
  assertDataset,
  assertNumericType,
  assertArrayShape,
  assertNumericOrComplexType,
} from '../../guards';
import type { NxAttribute, SilxStyle } from './models';
import { isScaleType } from '../core/utils';
import { getChildEntity } from '../../utils';

export function getAttributeValue(
  entity: Entity,
  attributeName: NxAttribute
): unknown {
  return entity.attributes?.find((attr) => attr.name === attributeName)?.value;
}

export function isNxDataGroup(group: Group) {
  return getAttributeValue(group, 'NX_class') === 'NXdata';
}

export function assertNxDataGroup(group: Group) {
  if (!isNxDataGroup(group)) {
    throw new Error('Expected NXdata group');
  }
}

export function findSignalDataset(
  group: Group
): Dataset<ArrayShape, NumericType | ComplexType> {
  const signal = getAttributeValue(group, 'signal');
  assertDefined(signal, "Expected 'signal' attribute");
  assertStr(signal, "Expected 'signal' attribute to be a string");

  const dataset = getChildEntity(group, signal);
  assertDefined(dataset, `Expected "${signal}" signal entity to exist`);
  assertDataset(dataset, `Expected "${signal}" signal to be a dataset`);
  assertArrayShape(dataset);
  assertNumericOrComplexType(dataset);

  return dataset;
}

export function findErrorsDataset(
  group: Group,
  signalName: string
): NumArrayDataset | undefined {
  const dataset =
    getChildEntity(group, `${signalName}_errors`) ||
    getChildEntity(group, 'errors');

  if (!dataset) {
    return undefined;
  }

  assertDataset(dataset);
  assertArrayShape(dataset);
  assertNumericType(dataset);
  return dataset;
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

    const axisScaleTypes =
      typeof axes_scale_type === 'string' ? [axes_scale_type] : axes_scale_type;

    return {
      signalScaleType: isScaleType(signal_scale_type)
        ? signal_scale_type
        : undefined,
      axisScaleTypes:
        Array.isArray(axisScaleTypes) && axisScaleTypes.every(isScaleType)
          ? axisScaleTypes
          : undefined,
    };
  } catch {
    console.warn(`Malformed 'SILX_style' attribute: ${silxStyle}`); // eslint-disable-line no-console
    return {};
  }
}
