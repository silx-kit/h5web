import {
  assertArray,
  assertArrayShape,
  assertDataset,
  assertDefined,
  assertNumericOrComplexType,
  assertNumericType,
  assertScalarShape,
  assertStr,
  assertStringType,
  isAxisScaleType,
  isColorScaleType,
  isDefined,
} from '@h5web/shared/guards';
import type {
  ArrayShape,
  ComplexType,
  Dataset,
  Group,
  GroupWithChildren,
  NumArrayDataset,
  NumericType,
  ScalarShape,
  StringType,
} from '@h5web/shared/hdf5-models';
import { getChildEntity } from '@h5web/shared/hdf5-utils';

import type { AttrValuesStore } from '../../providers/models';
import { hasAttribute } from '../../utils';
import type { AxisDef, DatasetInfo, SilxStyle } from './models';

export function isNxDataGroup(
  group: GroupWithChildren,
  attrValuesStore: AttrValuesStore,
): boolean {
  return (
    attrValuesStore.getSingle(group, 'NX_class') === 'NXdata' &&
    (hasAttribute(group, 'signal') ||
      group.children.some((child) => hasAttribute(child, 'signal')))
  );
}

export function assertNxDataGroup(
  group: GroupWithChildren,
  attrValuesStore: AttrValuesStore,
): void {
  if (!isNxDataGroup(group, attrValuesStore)) {
    throw new Error('Expected NXdata group');
  }
}

export function isNxNoteGroup(
  group: GroupWithChildren,
  attrValuesStore: AttrValuesStore,
): boolean {
  return attrValuesStore.getSingle(group, 'NX_class') === 'NXnote';
}

function findOldStyleSignalDataset(
  group: GroupWithChildren,
): Dataset<ArrayShape, NumericType | ComplexType> {
  const dataset = group.children.find((child) => hasAttribute(child, 'signal'));
  assertDefined(dataset);
  assertDataset(
    dataset,
    `Expected old-style "${dataset.name}" signal to be a dataset`,
  );
  assertArrayShape(dataset);
  assertNumericOrComplexType(dataset);
  return dataset;
}

export function findSignalDataset(
  group: GroupWithChildren,
  attrValuesStore: AttrValuesStore,
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

export function findErrorDataset(
  group: GroupWithChildren,
  signalName: string,
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

export function findAuxErrorDataset(
  group: GroupWithChildren,
  auxSignalName: string,
): NumArrayDataset | undefined {
  const dataset = getChildEntity(group, `${auxSignalName}_errors`);

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
  attrValuesStore: AttrValuesStore,
): (Dataset<ArrayShape> | undefined)[] {
  const dsetList = attrValuesStore.getSingle(group, type) || [];
  const dsetNames = typeof dsetList === 'string' ? [dsetList] : dsetList;
  assertArray(dsetNames);

  return dsetNames.map((name) => {
    assertStr(name);
    if (name === '.') {
      return undefined;
    }
    if (name.includes('/')) {
      throw new Error(
        `Expected "${name}" to be the name of a child dataset, not a path`,
      );
    }

    const dataset = getChildEntity(group, name);
    assertDefined(dataset, `Expected child entity "${name}" to exist`);
    assertDataset(dataset, `Expected child "${name}" to be a dataset`);
    assertArrayShape(dataset);
    return dataset;
  });
}

function parseAxesList(dsetList: unknown): string[] {
  if (typeof dsetList !== 'string') {
    return [];
  }

  if (dsetList.includes(':')) {
    return dsetList.split(':');
  }

  if (dsetList.includes(',')) {
    return dsetList.split(',');
  }

  return [dsetList];
}

function findOldStyleAxesDatasets(
  group: GroupWithChildren,
  signal: Dataset,
  attrValuesStore: AttrValuesStore,
): NumArrayDataset[] {
  const axesList = attrValuesStore.getSingle(signal, 'axes');
  const axesNames = parseAxesList(axesList);

  return axesNames.map((name) => {
    const dataset = getChildEntity(group, name);
    assertDefined(dataset);
    assertDataset(dataset);
    assertArrayShape(dataset);
    assertNumericType(dataset);
    return dataset;
  });
}

export function findAxesDatasets(
  group: GroupWithChildren,
  signal: Dataset,
  attrValuesStore: AttrValuesStore,
): (NumArrayDataset | undefined)[] {
  if (!hasAttribute(group, 'axes')) {
    return findOldStyleAxesDatasets(group, signal, attrValuesStore);
  }

  return findAssociatedDatasets(group, 'axes', attrValuesStore).map(
    (dataset) => {
      if (dataset) {
        assertNumericType(dataset);
      }
      return dataset;
    },
  );
}

export function findAuxiliaryDatasets(
  group: GroupWithChildren,
  attrValuesStore: AttrValuesStore,
): Dataset<ArrayShape, NumericType | ComplexType>[] {
  return findAssociatedDatasets(group, 'auxiliary_signals', attrValuesStore)
    .filter(isDefined)
    .map((dataset) => {
      assertNumericOrComplexType(dataset);
      return dataset;
    });
}

export function findTitleDataset(
  group: GroupWithChildren,
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
  attrValuesStore: AttrValuesStore,
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
      signalScaleType: isColorScaleType(signal_scale_type)
        ? signal_scale_type
        : undefined,
      axisScaleTypes: Array.isArray(axisScaleTypes)
        ? axisScaleTypes.map((type) =>
            isAxisScaleType(type) ? type : undefined,
          )
        : undefined,
    };
  } catch {
    console.warn(`Malformed 'SILX_style' attribute: ${silxStyle}`); // eslint-disable-line no-console
    return {};
  }
}

export function getDatasetInfo(
  dataset: Dataset,
  attrValuesStore: AttrValuesStore,
): DatasetInfo {
  const rawLongName = attrValuesStore.getSingle(dataset, 'long_name');
  const longName =
    rawLongName && typeof rawLongName === 'string' ? rawLongName : undefined;

  const rawUnits = attrValuesStore.getSingle(dataset, 'units');
  const units = rawUnits && typeof rawUnits === 'string' ? rawUnits : undefined;

  return {
    label: longName || (units ? `${dataset.name} (${units})` : dataset.name),
    unit: units,
  };
}

export function guessKeepRatio(
  xAxisDef: AxisDef | undefined,
  yAxisDef: AxisDef | undefined,
): boolean | undefined {
  if (!xAxisDef?.unit && !yAxisDef?.unit) {
    return undefined;
  }

  return xAxisDef?.unit === yAxisDef?.unit;
}

export function areSameDims(dims1: ArrayShape, dims2: ArrayShape): boolean {
  return (
    dims1.length === dims2.length &&
    dims1.every((dim, index) => dim === dims2[index])
  );
}

export function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch (error: unknown) {
    throw new Error('Expected valid JSON', { cause: error });
  }
}
