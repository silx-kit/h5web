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

import { type DataContextValue } from '../../providers/DataProvider';
import {
  findAttribute,
  findScalarStrAttr,
  getAttributeValue,
  hasAttribute,
} from '../../utils';
import {
  type AxisDef,
  type DefaultSlice,
  type FieldInfo,
  type SilxStyle,
} from './models';

export async function getNxClass(
  group: Group,
  dataContext: DataContextValue,
): Promise<string | undefined> {
  const attr = findScalarStrAttr(group, 'NX_class');
  return getAttributeValue(group, attr, dataContext);
}

export async function isNxDataGroup(
  group: GroupWithChildren,
  dataContext: DataContextValue,
): Promise<boolean> {
  return (
    (await getNxClass(group, dataContext)) === 'NXdata' &&
    (hasAttribute(group, 'signal') ||
      group.children.some((child) => hasAttribute(child, 'signal')))
  );
}

export async function assertNxDataGroup(
  group: GroupWithChildren,
  dataContext: DataContextValue,
): Promise<void> {
  if (!(await isNxDataGroup(group, dataContext))) {
    throw new Error('Expected NXdata group');
  }
}

export async function isNxNoteGroup(
  group: GroupWithChildren,
  dataContext: DataContextValue,
): Promise<boolean> {
  return (await getNxClass(group, dataContext)) === 'NXnote';
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

export async function findSignalDataset(
  group: GroupWithChildren,
  dataContext: DataContextValue,
): Promise<Dataset<ArrayShape, NumericLikeType | ComplexType>> {
  const signalAttr = findAttribute(group, 'signal');
  if (!signalAttr) {
    return findOldStyleSignalDataset(group);
  }

  assertScalarShape(signalAttr);
  assertStringType(signalAttr, "Expected 'signal' attribute to be a string");
  const signal = await getAttributeValue(group, signalAttr, dataContext);

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

async function findAssociatedDatasets(
  group: GroupWithChildren,
  type: 'axes' | 'auxiliary_signals',
  dataContext: DataContextValue,
): Promise<(Dataset<ArrayShape> | undefined)[]> {
  const attr = findAttribute(group, type);
  if (!attr || !hasNonNullShape(attr) || !hasStringType(attr)) {
    return [];
  }

  const dsetNames = castArray(
    await getAttributeValue(group, attr, dataContext),
  );

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

async function findOldStyleAxesDatasets(
  group: GroupWithChildren,
  signal: Dataset,
  dataContext: DataContextValue,
): Promise<Dataset<ArrayShape, NumericType>[]> {
  const axesAttr = findScalarStrAttr(signal, 'axes');
  if (!axesAttr) {
    return [];
  }

  const axes = await getAttributeValue(signal, axesAttr, dataContext);

  return parseAxesList(axes).map((name) => {
    const dataset = getChildEntity(group, name);
    assertDefined(dataset);
    assertDataset(dataset);
    assertArrayShape(dataset);
    assertNumericType(dataset);
    return dataset;
  });
}

export async function findAxesDatasets(
  group: GroupWithChildren,
  signal: Dataset,
  dataContext: DataContextValue,
): Promise<(Dataset<ArrayShape, NumericType> | undefined)[]> {
  if (!hasAttribute(group, 'axes')) {
    return findOldStyleAxesDatasets(group, signal, dataContext);
  }

  const associated = await findAssociatedDatasets(group, 'axes', dataContext);
  return associated.map((dataset) => {
    if (dataset) {
      assertNumericType(dataset);
    }
    return dataset;
  });
}

export async function findAuxiliaryDatasets(
  group: GroupWithChildren,
  dataContext: DataContextValue,
): Promise<Dataset<ArrayShape, NumericLikeType | ComplexType>[]> {
  const associated = await findAssociatedDatasets(
    group,
    'auxiliary_signals',
    dataContext,
  );

  return associated.filter(isDefined).map((dataset) => {
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

export async function getDefaultSlice(
  group: Group,
  signalDims: number[],
  dataContext: DataContextValue,
): Promise<DefaultSlice | undefined> {
  const defaultSliceAttr = findAttribute(group, 'default_slice');

  if (
    !defaultSliceAttr ||
    !hasArrayShape(defaultSliceAttr) ||
    !hasStringType(defaultSliceAttr)
  ) {
    return undefined;
  }

  const defaultSliceRaw = await getAttributeValue(
    group,
    defaultSliceAttr,
    dataContext,
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

export async function getSilxStyle(
  group: Group,
  dataContext: DataContextValue,
): Promise<SilxStyle> {
  const silxStyleAttr = findScalarStrAttr(group, 'SILX_style');
  if (!silxStyleAttr) {
    return {};
  }

  const silxStyle = await getAttributeValue(group, silxStyleAttr, dataContext);

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

export async function getFieldInfo(
  dataset: Dataset,
  dataContext: DataContextValue,
): Promise<FieldInfo> {
  const longNameAttr = findScalarStrAttr(dataset, 'long_name');
  const longName = await getAttributeValue(dataset, longNameAttr, dataContext);

  const unitsAttr = findScalarStrAttr(dataset, 'units');
  const units = await getAttributeValue(dataset, unitsAttr, dataContext);

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
