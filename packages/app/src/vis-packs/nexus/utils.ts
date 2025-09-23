import { type DimensionMapping } from '@h5web/lib';
import {
  assertArray,
  assertArrayShape,
  assertDataset,
  assertDefined,
  assertNumericLikeOrComplexType,
  assertNumericType,
  assertScalarShape,
  assertStr,
  assertStringType,
  isAxisScaleType,
  isColorScaleType,
  isDefined,
  isGroup,
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
import { buildEntityPath } from '@h5web/shared/hdf5-utils';

import { type AttrValuesStore } from '../../providers/models';
import { hasAttribute } from '../../utils';
import {
  type AxisDef,
  type DatasetInfo,
  type DefaultSlice,
  type SilxStyle,
} from './models';

import { type EntitiesStore } from '../../providers/models';

/**
 * Resolve a (possibly nested) entity name relative to an NXdata group.
 * - If `name` is a nested path (contains '/'), traverse child groups.
 * - If traversal fails and `entitiesStore` is provided, build an absolute
 *   path and query the store.
 * Returns the resolved entity or undefined.
 */
export function resolveNxEntity(
  group: GroupWithChildren,
  name: string,
  entitiesStore?: EntitiesStore,
): any | undefined {
  if (!name) return undefined;

  // dot means none
  if (name === '.') return undefined;

  // If it's a nested path, prefer resolving via the global entities store
  // because the `group` object may not contain grandchildren at runtime.
  if (name.includes('/')) {
    if (entitiesStore) {
      const path = buildEntityPath(group.path, name);
      const ent = entitiesStore.get(path);
      if (ent) return ent;
    }

    // Fallback: try traversal relative to the group (best-effort)
    const segments = name.split('/');
    let current: GroupWithChildren | undefined = group as GroupWithChildren;
    let ent: any;
    for (let i = 0; i < segments.length; i += 1) {
      ent = getChildEntity(current, segments[i]);
      if (!ent) {
        ent = undefined;
        break;
      }
      if (i < segments.length - 1) {
        if (!isGroup(ent)) return undefined;
        current = ent as GroupWithChildren;
      }
    }

    return ent;
  }

  // Not a nested path: try direct child first, then entities store
  const child = getChildEntity(group, name);
  if (child) return child;

  if (entitiesStore) {
    const path = buildEntityPath(group.path, name);
    return entitiesStore.get(path);
  }

  return undefined;
}

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
  entitiesStore?: EntitiesStore,
): Dataset<ArrayShape, NumericLikeType | ComplexType> {
  if (!hasAttribute(group, 'signal')) {
    return findOldStyleSignalDataset(group);
  }

  const signal = attrValuesStore.getSingle(group, 'signal');
  assertDefined(signal, "Expected 'signal' attribute");
  assertStr(signal, "Expected 'signal' attribute to be a string");

  const ent = resolveNxEntity(group, signal, entitiesStore);
  assertDefined(ent, `Expected "${signal}" signal entity to exist`);
  assertDataset(ent, `Expected "${signal}" signal to be a dataset`);
  assertArrayShape(ent);
  assertNumericLikeOrComplexType(ent);
  return ent as Dataset<ArrayShape, NumericLikeType | ComplexType>;
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
  entitiesStore?: EntitiesStore,
): (Dataset<ArrayShape> | undefined)[] {
  const dsetList = attrValuesStore.getSingle(group, type) || [];
  const dsetNames = typeof dsetList === 'string' ? [dsetList] : dsetList;
  assertArray(dsetNames);

  return dsetNames.map((name) => {
    assertStr(name);
    if (name === '.') {
      return undefined;
    }
  const ent = resolveNxEntity(group, name, entitiesStore);
  assertDefined(ent, `Expected entity "${name}" to exist`);
  assertDataset(ent, `Expected "${name}" to be a dataset`);
  assertArrayShape(ent);
  return ent;
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
  entitiesStore?: EntitiesStore,
): Dataset<ArrayShape, NumericType>[] {
  const axesList = attrValuesStore.getSingle(signal, 'axes');
  const axesNames = parseAxesList(axesList);

  return axesNames.map((name) => {
  const ent = resolveNxEntity(group, name, entitiesStore);
  assertDefined(ent);
  assertDataset(ent);
  assertArrayShape(ent);
  assertNumericType(ent);
  return ent;
  });
}

export function findAxesDatasets(
  group: GroupWithChildren,
  signal: Dataset,
  attrValuesStore: AttrValuesStore,
  entitiesStore?: EntitiesStore,
): (Dataset<ArrayShape, NumericType> | undefined)[] {
  if (!hasAttribute(group, 'axes')) {
    return findOldStyleAxesDatasets(
      group,
      signal,
      attrValuesStore,
      entitiesStore,
    );
  }

  return findAssociatedDatasets(
    group,
    'axes',
    attrValuesStore,
    entitiesStore,
  ).map(
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
  entitiesStore?: EntitiesStore,
): Dataset<ArrayShape, NumericLikeType | ComplexType>[] {
  return findAssociatedDatasets(
    group,
    'auxiliary_signals',
    attrValuesStore,
    entitiesStore,
  )
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
  const defaultSliceRaw = attrValuesStore.getSingle(group, 'default_slice');

  if (
    !Array.isArray(defaultSliceRaw) ||
    !defaultSliceRaw.every((v) => typeof v === 'string')
  ) {
    return undefined;
  }

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
