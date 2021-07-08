import type {
  Group,
  Dataset,
  NumArrayDataset,
  NumericType,
  ArrayShape,
  ComplexType,
  ScalarShape,
  StringType,
  GroupWithChildren,
  Entity,
} from '../../providers/models';
import {
  assertDefined,
  assertStr,
  assertDataset,
  assertNumericType,
  assertArrayShape,
  assertNumericOrComplexType,
  assertScalarShape,
  assertStringType,
  assertArray,
  isDefined,
  isGroup,
} from '../../guards';
import type { NxData, SilxStyle } from './models';
import { isScaleType } from '../core/utils';
import { getAttributeValue, getChildEntity } from '../../utils';

export function isNxDataGroup(group: Group): boolean {
  return getAttributeValue(group, 'NX_class') === 'NXdata';
}

export function assertNxDataGroup(group: Group): void {
  if (!isNxDataGroup(group)) {
    throw new Error('Expected NXdata group');
  }
}

export function isNxGroup(entity: Entity): boolean {
  return (
    isGroup(entity) &&
    (isNxDataGroup(entity) || !!getAttributeValue(entity, 'default'))
  );
}

export function findSignalDataset(
  group: GroupWithChildren
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

function findErrorsDataset(
  group: GroupWithChildren,
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

function findAssociatedDatasets(
  group: GroupWithChildren,
  type: 'axes' | 'auxiliary_signals'
): (NumArrayDataset | undefined)[] {
  const dsetList = getAttributeValue(group, type) || [];
  const dsetNames = typeof dsetList === 'string' ? [dsetList] : dsetList;
  assertArray<string>(dsetNames);

  return dsetNames.map((name) => {
    if (name === '.') {
      return undefined;
    }

    const dataset = getChildEntity(group, name);
    assertDefined(dataset);
    assertDataset(dataset);
    assertArrayShape(dataset);
    assertNumericType(dataset);

    return dataset;
  });
}

function findTitleDataset(
  group: GroupWithChildren
): Dataset<ScalarShape, StringType> | undefined {
  const dataset = getChildEntity(group, 'title');
  if (!dataset) {
    return undefined;
  }

  assertDataset(dataset);
  assertScalarShape(dataset);
  assertStringType(dataset);

  return dataset;
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

export function getNxData(group: GroupWithChildren): NxData {
  assertNxDataGroup(group);
  const signalDataset = findSignalDataset(group);
  const errorsDataset = findErrorsDataset(group, signalDataset.name);
  const auxDatasets = findAssociatedDatasets(group, 'auxiliary_signals');

  return {
    signalDataset,
    errorsDataset,
    axisDatasets: findAssociatedDatasets(group, 'axes'),
    titleDataset: findTitleDataset(group),
    silxStyle: getSilxStyle(group),
    auxDatasets: auxDatasets.filter(isDefined),
  };
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
