import type { AxisParams, ScatterAxisParams } from '@h5web/lib';
import {
  assertArray,
  assertArrayShape,
  assertComplexType,
  assertDataset,
  assertDefined,
  assertNumericOrComplexType,
  assertNumericType,
  assertScalarShape,
  assertStr,
  assertStringType,
  getChildEntity,
  isScaleType,
} from '@h5web/shared';
import type {
  Group,
  ArrayShape,
  ComplexType,
  Dataset,
  GroupWithChildren,
  NumericType,
  ScalarShape,
  StringType,
  NumArrayDataset,
} from '@h5web/shared';

import type { AttrValuesStore } from '../../providers/models';
import { hasAttribute } from '../../utils';
import type { NxData, SilxStyle } from './models';

export function isNxDataGroup(
  group: GroupWithChildren,
  attrValuesStore: AttrValuesStore
): boolean {
  return (
    attrValuesStore.getSingle(group, 'NX_class') === 'NXdata' &&
    (hasAttribute(group, 'signal') ||
      group.children.some((child) => hasAttribute(child, 'signal')))
  );
}

export function assertNxDataGroup(
  group: GroupWithChildren,
  attrValuesStore: AttrValuesStore
): void {
  if (!isNxDataGroup(group, attrValuesStore)) {
    throw new Error('Expected NXdata group');
  }
}

function findOldStyleSignalDataset(
  group: GroupWithChildren
): Dataset<ArrayShape, NumericType | ComplexType> {
  const dataset = group.children.find((child) => hasAttribute(child, 'signal'));
  assertDefined(dataset);
  assertDataset(
    dataset,
    `Expected old-style "${dataset.name}" signal to be a dataset`
  );
  assertArrayShape(dataset);
  assertNumericOrComplexType(dataset);
  return dataset;
}

export function findSignalDataset(
  group: GroupWithChildren,
  attrValuesStore: AttrValuesStore
): Dataset<ArrayShape, NumericType | ComplexType> {
  if (!hasAttribute(group, 'signal')) {
    return findOldStyleSignalDataset(group);
  }

  const signal = attrValuesStore.getSingle(group, 'signal');
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

export function findAssociatedDatasets(
  group: GroupWithChildren,
  type: 'axes' | 'auxiliary_signals',
  attrValuesStore: AttrValuesStore
): (NumArrayDataset | undefined)[] {
  const dsetList = attrValuesStore.getSingle(group, type) || [];
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

export function findTitleDataset(
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

export function getSilxStyle(
  group: Group,
  attrValuesStore: AttrValuesStore
): SilxStyle {
  const silxStyle = attrValuesStore.getSingle(group, 'SILX_style');

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

export function getDatasetLabel(
  dataset: Dataset,
  attrValuesStore: AttrValuesStore
): string {
  const longName = attrValuesStore.getSingle(dataset, 'long_name');
  if (longName && typeof longName === 'string') {
    return longName;
  }

  const units = attrValuesStore.getSingle(dataset, 'units');
  if (units && typeof units === 'string') {
    return `${dataset.name} (${units})`;
  }

  return dataset.name;
}

export function assertNumericSignal(
  nxData: NxData
): asserts nxData is NxData<NumericType> {
  assertNumericType(nxData.signalDataset);
}

export function assertComplexSignal(
  nxData: NxData
): asserts nxData is NxData<ComplexType> {
  assertComplexType(nxData.signalDataset);
}

export function assertScatterAxisParams(
  params: AxisParams | undefined
): asserts params is ScatterAxisParams {
  assertDefined(params?.value);
}
