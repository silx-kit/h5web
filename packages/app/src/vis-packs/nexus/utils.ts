import { type DimensionMapping } from '@h5web/lib';
import {
  assertArrayShape,
  assertDataset,
  assertDefined,
  assertNumericLikeOrComplexType,
  assertNumericType,
  assertScalarShape,
  assertStringType,
  hasArrayShape,
  hasNonNullShape,
  hasScalarShape,
  hasStringType,
  isAxisScaleType,
  isColorScaleType,
  isDefined,
} from '@h5web/shared/guards';
import {
  type ArrayShape,
  type ComplexType,
  type Dataset,
  type Group,
  type GroupWithChildren,
  type NumericLikeType,
  type NumericType,
  type ScalarShape,
  type StringType,
} from '@h5web/shared/hdf5-models';
import { getChildEntity } from '@h5web/shared/hdf5-utils';
import { castArray } from '@h5web/shared/vis-utils';

import { type AttrValuesStore } from '../../providers/models';
import { findAttribute, getAttributeValue, hasAttribute } from '../../utils';
import {
  type AxisDef,
  type DatasetInfo,
  type DefaultSlice,
  type SilxStyle,
} from './models';

export function getNxClass(
  group: Group,
  attrValuesStore: AttrValuesStore,
): string | undefined {
  const attr = findAttribute(group, 'NX_class');
  if (!attr || !hasScalarShape(attr) || !hasStringType(attr)) {
    return undefined;
  }

  return getAttributeValue(group, attr, attrValuesStore);
}

export function isNxDataGroup(
  group: GroupWithChildren,
  attrValuesStore: AttrValuesStore,
): boolean {
  return (
    getNxClass(group, attrValuesStore) === 'NXdata' &&
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
  return getNxClass(group, attrValuesStore) === 'NXnote';
}

function findOldStyleSignalDataset(
  group: GroupWithChildren,
): Dataset<ArrayShape, NumericLikeType | ComplexType> {
  const dataset = group.children.find((child) => hasAttribute(child, 'signal'));
  assertDefined(dataset);
  assertDataset(
    dataset,
    `Expected old-style "${dataset.name}" signal to be a dataset`,
  );
  assertArrayShape(dataset);
  assertNumericLikeOrComplexType(dataset);
  return dataset;
}

export function findSignalDataset(
  group: GroupWithChildren,
  attrValuesStore: AttrValuesStore,
): Dataset<ArrayShape, NumericLikeType | ComplexType> {
  const signalAttr = findAttribute(group, 'signal');
  if (!signalAttr) {
    return findOldStyleSignalDataset(group);
  }

  assertScalarShape(signalAttr);
  assertStringType(signalAttr, "Expected 'signal' attribute to be a string");
  const signal = getAttributeValue(group, signalAttr, attrValuesStore);

  const dataset = getChildEntity(group, signal);
  assertDefined(dataset, `Expected "${signal}" signal entity to exist`);
  assertDataset(dataset, `Expected "${signal}" signal to be a dataset`);
  assertArrayShape(dataset);
  assertNumericLikeOrComplexType(dataset);
  return dataset;
}

export function findErrorDataset(
  group: GroupWithChildren,
  signalName: string,
): Dataset<ArrayShape, NumericType> | undefined {
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
): Dataset<ArrayShape, NumericType> | undefined {
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
  const attr = findAttribute(group, type);
  if (!attr || !hasNonNullShape(attr) || !hasStringType(attr)) {
    return [];
  }

  const dsetNames = castArray(getAttributeValue(group, attr, attrValuesStore));

  return dsetNames.map((name) => {
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

function parseAxesList(dsetList: string): string[] {
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
): Dataset<ArrayShape, NumericType>[] {
  const axesAttr = findAttribute(signal, 'axes');
  if (!axesAttr || !hasScalarShape(axesAttr) || !hasStringType(axesAttr)) {
    return [];
  }

  const axes = getAttributeValue(signal, axesAttr, attrValuesStore);

  return parseAxesList(axes).map((name) => {
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
): (Dataset<ArrayShape, NumericType> | undefined)[] {
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
): Dataset<ArrayShape, NumericLikeType | ComplexType>[] {
  return findAssociatedDatasets(group, 'auxiliary_signals', attrValuesStore)
    .filter(isDefined)
    .map((dataset) => {
      assertNumericLikeOrComplexType(dataset);
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

export function getDefaultSlice(
  group: Group,
  signalDims: number[],
  attrValuesStore: AttrValuesStore,
): DefaultSlice | undefined {
  const defaultSliceAttr = findAttribute(group, 'default_slice');

  if (
    !defaultSliceAttr ||
    !hasArrayShape(defaultSliceAttr) ||
    !hasStringType(defaultSliceAttr)
  ) {
    return undefined;
  }

  const defaultSliceRaw = getAttributeValue(
    group,
    defaultSliceAttr,
    attrValuesStore,
  );

  if (defaultSliceRaw.length !== signalDims.length) {
    // eslint-disable-next-line no-console
    console.warn(
      "Malformed 'default_slice' attribute: expected same length as signal dimensions",
    );
    return undefined;
  }

  const defaultSlice = defaultSliceRaw.map((v) => {
    return v === '.' ? v : Number.parseInt(v);
  });

  const isValid = defaultSlice.every((v, i) => {
    // Look for invalid or out-of-bounds indices
    return v === '.' || (!Number.isNaN(v) && v >= 0 && v < signalDims[i]);
  });

  if (!isValid) {
    // eslint-disable-next-line no-console
    console.warn(
      "Malformed 'default_slice' attribute: expected indices within bounds of signal dimensions",
    );
    return undefined;
  }

  return defaultSlice;
}

export function getSilxStyle(
  group: Group,
  attrValuesStore: AttrValuesStore,
): SilxStyle {
  const silxStyleAttr = findAttribute(group, 'SILX_style');

  if (
    !silxStyleAttr ||
    !hasScalarShape(silxStyleAttr) ||
    !hasStringType(silxStyleAttr)
  ) {
    return {};
  }

  const silxStyle = getAttributeValue(group, silxStyleAttr, attrValuesStore);

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
  const longNameAttr = findAttribute(dataset, 'long_name');
  const unitsAttr = findAttribute(dataset, 'units');

  const longName =
    longNameAttr && hasScalarShape(longNameAttr) && hasStringType(longNameAttr)
      ? getAttributeValue(dataset, longNameAttr, attrValuesStore)
      : undefined;

  const units =
    unitsAttr && hasScalarShape(unitsAttr) && hasStringType(unitsAttr)
      ? getAttributeValue(dataset, unitsAttr, attrValuesStore)
      : undefined;

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

export function areSameDims(dims1: number[], dims2: number[]): boolean {
  return (
    dims1.length === dims2.length &&
    dims1.every((dim, index) => dim === dims2[index])
  );
}

export function applyDefaultSlice(
  mapping: DimensionMapping,
  defaultSlice: DefaultSlice,
): DimensionMapping {
  const mappedDims = mapping.filter((v) => typeof v !== 'number');
  if (mappedDims.length !== defaultSlice.filter((v) => v === '.').length) {
    return mapping; // default slice incompatible with mapping; leave mapping as is
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return defaultSlice.map((v) => (v === '.' ? mappedDims.shift()! : v));
}

export function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch (error: unknown) {
    throw new Error('Expected valid JSON', { cause: error });
  }
}
