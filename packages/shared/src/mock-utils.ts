import { hasChildren, isGroup } from './guards';
import {
  type ArrayShape,
  type Attribute,
  type ChildEntity,
  type Dataset,
  type Datatype,
  type DType,
  type Entity,
  EntityKind,
  type Group,
  type GroupWithChildren,
  type LinkClass,
  type ScalarShape,
  type Shape,
  type UnresolvedEntity,
} from './hdf5-models';
import {
  boolType,
  buildEntityPath,
  cplxType,
  floatType,
  intType,
  strType,
  unknownType,
} from './hdf5-utils';
import {
  type MockAttribute,
  type MockDataset,
  type MockValueId,
} from './mock-models';
import { mockValues } from './mock-values';
import { type SilxStyle } from './nexus-models';

export function assertMockDataset<S extends Shape, T extends DType>(
  dtst: Dataset<S, T>,
): asserts dtst is MockDataset<S, T> {
  if (!('value' in dtst)) {
    throw new Error('Expected mock dataset');
  }
}

export function assertMockAttribute<S extends Shape, T extends DType>(
  attr: Attribute<S, T>,
): asserts attr is MockAttribute<S, T> {
  if (!('value' in attr)) {
    throw new Error('Expected mock attribute');
  }
}

/* ---------------------- */
/* ----- ATTRIBUTES ----- */

export function attribute<S extends Shape, T extends DType>(
  name: string,
  type: T,
  shape: S,
  value: unknown,
): MockAttribute<S, T> {
  return { name, type, shape, value };
}

export function scalarAttr(
  name: string,
  value: unknown,
  opts: { type?: DType } = {},
): MockAttribute<ScalarShape> {
  const { type } = opts;
  return attribute(name, type || guessType(value), [], value);
}

export function arrayAttr(
  name: string,
  value: unknown[],
  opts: { type?: DType } = {},
): MockAttribute<ArrayShape> {
  const { type } = opts;

  return attribute(name, type || guessType(value[0]), [value.length], value);
}

export function withAttr<T extends Entity>(
  entity: T,
  attributes: Attribute[],
): T {
  return {
    ...entity,
    attributes: [...entity.attributes, ...attributes],
  };
}

export function withImageAttr<T extends Entity>(entity: T): T {
  return withAttr(entity, [
    scalarAttr('CLASS', 'IMAGE'),
    scalarAttr('IMAGE_SUBCLASS', 'IMAGE_TRUECOLOR'),
  ]);
}

/* -------------------- */
/* ----- ENTITIES ----- */

type EntityOpts = Partial<Pick<Entity, 'attributes' | 'link'>>;
type GroupOpts = EntityOpts & { isRoot?: boolean; children?: ChildEntity[] };

export function group(
  name: string,
  children: ChildEntity[] = [],
  opts: Omit<GroupOpts, 'children'> = {},
): GroupWithChildren {
  const { attributes = [], link, isRoot = false } = opts;
  const path = isRoot ? '/' : `/${name}`;

  const grp: GroupWithChildren = {
    name,
    path,
    kind: EntityKind.Group,
    children,
    attributes,
    link,
  };

  prefixChildrenPaths(grp, path);
  return grp;
}

export function dataset<S extends Shape, T extends DType>(
  name: string,
  type: T,
  shape: S,
  value?: unknown,
  opts: EntityOpts = {},
): MockDataset<S, T> {
  const { attributes = [], link } = opts;

  return {
    name,
    path: `/${name}`,
    kind: EntityKind.Dataset,
    attributes,
    shape,
    type,
    value,
    link,
  };
}

export function scalar(
  name: string,
  value: unknown,
  opts: EntityOpts & { type?: DType } = {},
): MockDataset<ScalarShape> {
  const { type, ...entityOpts } = opts;
  return dataset(name, type || guessType(value), [], value, entityOpts);
}

export function array(
  name: string,
  opts: EntityOpts & { type?: DType; valueId?: MockValueId } = {},
): MockDataset<ArrayShape> {
  const { type, valueId = name, ...entityOpts } = opts;
  const arr = mockValues[valueId as MockValueId]();

  return dataset(
    name,
    type || guessType(arr.data[0]),
    arr.shape,
    arr.data,
    entityOpts,
  );
}

export function datatype<T extends DType>(
  name: string,
  type: T,
  opts: EntityOpts = {},
): Datatype<T> {
  const { attributes = [], link } = opts;

  return {
    name,
    path: `/${name}`,
    kind: EntityKind.Datatype,
    attributes,
    type,
    link,
  };
}

export function unresolved(
  name: string,
  linkClass: LinkClass,
  pathToEntity?: string,
  file?: string,
): UnresolvedEntity {
  return {
    name,
    path: `/${name}`,
    kind: EntityKind.Unresolved,
    attributes: [],
    link: { class: linkClass, file, path: pathToEntity },
  };
}

/* ----------------- */
/* ----- NEXUS ----- */

export function nxGroup(
  name: string,
  type: 'NXroot' | 'NXentry' | 'NXprocess' | 'NXdata' | 'NXnote',
  opts: { defaultPath?: string } & GroupOpts = {},
): GroupWithChildren {
  const { defaultPath, children, ...groupOpts } = opts;

  return group(name, children, {
    ...groupOpts,
    attributes: [
      ...(groupOpts.attributes ?? []),
      scalarAttr('NX_class', type),
      ...(defaultPath ? [scalarAttr('default', defaultPath)] : []),
    ],
  });
}

export function nxData<T extends Record<string, MockDataset<ArrayShape>>>(
  name: string,
  opts: {
    signal: MockDataset<ArrayShape>;
    errors?: MockDataset<ArrayShape>;
    title?: MockDataset<ScalarShape>;
    silxStyle?: SilxStyle;
  } & (
    | { axes: T; axesAttr: (Extract<keyof T, string> | '.')[] }
    | { axes?: never; axesAttr?: never }
  ) &
    (
      | { auxiliary: T; auxAttr: Extract<keyof T, string>[] }
      | { auxiliary?: never; auxAttr?: never }
    ) &
    GroupOpts,
): Group {
  const {
    signal,
    title,
    errors,
    axes = {},
    axesAttr,
    auxiliary = {},
    auxAttr,
    silxStyle,
    attributes = [],
    children = [],
    ...groupOpts
  } = opts;

  return nxGroup(name, 'NXdata', {
    ...groupOpts,
    attributes: [
      scalarAttr('signal', signal.name),
      ...(axesAttr ? [arrayAttr('axes', axesAttr)] : []),
      ...(auxAttr ? [arrayAttr('auxiliary_signals', auxAttr)] : []),
      ...(silxStyle ? [silxStyleAttr(silxStyle)] : []),
      ...attributes,
    ],
    children: [
      signal,
      ...(title ? [title] : []),
      ...(errors ? [errors] : []),
      ...Object.values<MockDataset>(axes),
      ...Object.values<MockDataset>(auxiliary),
      ...children,
    ],
  });
}

export function withNxAttr<T extends MockDataset<ArrayShape>>(
  dat: T,
  nxAttributes: {
    interpretation?: string;
    longName?: string;
    units?: string;
  },
): T {
  const { interpretation, longName, units } = nxAttributes;

  return withAttr(dat, [
    ...(interpretation ? [scalarAttr('interpretation', interpretation)] : []),
    ...(longName ? [scalarAttr('long_name', longName)] : []),
    ...(units ? [scalarAttr('units', units)] : []),
  ]);
}

/* ------------------------ */
/* --- INTERNAL HELPERS --- */

function guessType(value: unknown): DType {
  if (typeof value === 'number') {
    return floatType(64);
  }

  if (typeof value === 'bigint') {
    return intType(true, 64);
  }

  if (typeof value === 'boolean') {
    return boolType(intType(true, 8));
  }

  if (typeof value === 'string') {
    return strType();
  }

  if (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === 'number'
  ) {
    return cplxType(floatType(64));
  }

  return unknownType();
}

function prefixChildrenPaths(grp: GroupWithChildren, parentPath: string): void {
  grp.children.forEach((c) => {
    // eslint-disable-next-line no-param-reassign
    c.path = buildEntityPath(parentPath, c.path.slice(1));

    if (isGroup(c) && hasChildren(c)) {
      prefixChildrenPaths(c, parentPath);
    }
  });
}

function silxStyleAttr(style: SilxStyle): MockAttribute<ScalarShape> {
  const { signalScaleType, axisScaleTypes } = style;

  return scalarAttr(
    'SILX_style',
    JSON.stringify({
      signal_scale_type: signalScaleType,
      axes_scale_type: axisScaleTypes,
    }),
  );
}
