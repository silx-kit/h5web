import { hasChildren, isGroup } from '../guards';
import type {
  ArrayShape,
  Attribute,
  BooleanType,
  ChildEntity,
  ComplexType,
  CompoundType,
  Datatype,
  DType,
  Entity,
  Group,
  GroupWithChildren,
  LinkClass,
  NumericType,
  PrintableCompoundType,
  PrintableType,
  ScalarShape,
  Shape,
  StringType,
  UnknownType,
  UnresolvedEntity,
} from '../hdf5-models';
import { DTypeClass, Endianness, EntityKind } from '../hdf5-models';
import { buildEntityPath } from '../hdf5-utils';
import type { SilxStyle } from '../nexus-models';
import type { MockAttribute, MockDataset, MockValueId } from './models';
import { mockValues } from './values';

/* ----------------- */
/* ----- TYPES ----- */

export function intType(
  size: 8 | 16 | 32 | 64 = 32,
  unsigned = false,
  endianness = Endianness.LE,
): NumericType {
  return {
    class: unsigned ? DTypeClass.Unsigned : DTypeClass.Integer,
    endianness,
    size,
  };
}

export function floatType(
  size: 16 | 32 | 64 = 32,
  endianness = Endianness.LE,
): NumericType {
  return { class: DTypeClass.Float, endianness, size };
}

export function strType(
  charSet: StringType['charSet'] = 'ASCII',
  length?: number,
): StringType {
  return {
    class: DTypeClass.String,
    charSet,
    ...(length !== undefined && { length }),
  };
}

export function boolType(): BooleanType {
  return { class: DTypeClass.Bool };
}

export function cplxType(
  realType: NumericType,
  imagType = realType,
): ComplexType {
  return { class: DTypeClass.Complex, realType, imagType };
}

export function compoundType(fields: Record<string, DType>): CompoundType {
  return { class: DTypeClass.Compound, fields };
}

export function printableCompoundType(
  fields: Record<string, PrintableType>,
): PrintableCompoundType {
  return { class: DTypeClass.Compound, fields };
}

export function unknownType(): UnknownType {
  return { class: DTypeClass.Unknown };
}

function guessType(value: unknown): DType {
  if (typeof value === 'number') {
    return floatType(64);
  }

  if (typeof value === 'string') {
    return strType();
  }

  if (typeof value === 'boolean') {
    return boolType();
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

/* ---------------------- */
/* ----- ATTRIBUTES ----- */

export function attr<S extends Shape, T extends DType>(
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
  return attr(name, type || guessType(value), [], value);
}

export function arrayAttr(
  name: string,
  value: unknown[],
  opts: { type?: DType } = {},
): MockAttribute<ArrayShape> {
  const { type } = opts;

  return withMockValue(
    attr(name, type || guessType(value[0]), [value.length]),
    value,
  );
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
    scalarAttr('IMAGE_VERSION', '1.2'),
  ]);
}

/* -------------------- */
/* ----- ENTITIES ----- */

type EntityOpts = Partial<Pick<Entity, 'attributes' | 'link'>>;
type GroupOpts = EntityOpts & { isRoot?: boolean; children?: ChildEntity[] };

function prefixChildrenPaths(grp: GroupWithChildren, parentPath: string): void {
  grp.children.forEach((c) => {
    c.path = buildEntityPath(parentPath, c.path.slice(1));

    if (isGroup(c) && hasChildren(c)) {
      prefixChildrenPaths(c, parentPath);
    }
  });
}

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

export function silxStyleAttr(style: SilxStyle): MockAttribute<ScalarShape> {
  const { signalScaleType, axisScaleTypes } = style;

  return scalarAttr(
    'SILX_style',
    JSON.stringify({
      signal_scale_type: signalScaleType,
      axes_scale_type: axisScaleTypes,
    }),
  );
}

export function nxGroup(
  name: string,
  type: 'NXroot' | 'NXentry' | 'NXprocess' | 'NXdata',
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
