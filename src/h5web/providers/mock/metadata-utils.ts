import {
  Attribute,
  Datatype,
  Entity,
  EntityKind,
  Group,
  ScalarShape,
  Shape,
  ArrayShape,
  NumericType,
  StringType,
  DType,
  DTypeClass,
  Endianness,
  BooleanType,
  ComplexType,
  CompoundType,
  LinkClass,
  UnresolvedEntity,
  GroupWithChildren,
} from '../models';
import type { NxInterpretation, SilxStyle } from '../../vis-packs/nexus/models';
import { isGroup, hasChildren } from '../../guards';
import { buildEntityPath } from '../../utils';
import type { MockDataset, MockValueId } from './models';
import { mockValues } from './values';

/* -------------------------- */
/* ----- TYPES & SHAPES ----- */

export const intType: NumericType = {
  class: DTypeClass.Integer,
  endianness: Endianness.LE,
  size: 32,
};

export const unsignedType: NumericType = {
  class: DTypeClass.Unsigned,
  endianness: Endianness.LE,
  size: 16,
};

export const floatType: NumericType = {
  class: DTypeClass.Float,
  endianness: Endianness.LE,
  size: 64,
};

export const stringType: StringType = {
  class: DTypeClass.String,
  charSet: 'ASCII',
};

export const compoundType: CompoundType = {
  class: DTypeClass.Compound,
  fields: { int: intType },
};

export const booleanType: BooleanType = {
  class: DTypeClass.Bool,
};

export const complexType: ComplexType = {
  class: DTypeClass.Complex,
  realType: floatType,
  imagType: floatType,
};

/* ---------------------- */
/* ----- ATTRIBUTES ----- */

export function makeAttr<S extends Shape, T extends DType>(
  name: string,
  type: T,
  shape: S,
  value: unknown
): Attribute<S, T> {
  return { name, type, shape, value };
}

export function makeScalarAttr<T extends DType>(
  name: string,
  type: T,
  value: unknown
): Attribute<ScalarShape, T> {
  return makeAttr(name, type, [], value);
}

export function makeStrAttr(
  name: string,
  value: string
): Attribute<ScalarShape, StringType> {
  return makeScalarAttr(name, stringType, value);
}

export function makeIntAttr(
  name: string,
  value: number
): Attribute<ScalarShape, NumericType> {
  return makeScalarAttr(name, intType, value);
}

export function withAttributes<T extends Entity>(
  entity: T,
  attributes: Attribute[]
): T {
  return {
    ...entity,
    attributes: [...entity.attributes, ...attributes],
  };
}

export function withImageAttributes<T extends Entity>(entity: T): T {
  return withAttributes(entity, [
    makeStrAttr('CLASS', 'IMAGE'),
    makeStrAttr('IMAGE_VERSION', '1.2'),
  ]);
}

/* -------------------- */
/* ----- ENTITIES ----- */

type EntityOpts = Partial<Pick<Entity, 'attributes' | 'link'>>;
type GroupOpts = EntityOpts & { isRoot?: boolean; children?: Entity[] };
type DatasetOpts = EntityOpts & { valueId?: MockValueId };

function prefixChildrenPaths(
  group: GroupWithChildren,
  parentPath: string
): void {
  group.children.forEach((c) => {
    c.path = buildEntityPath(parentPath, c.path.slice(1));

    if (isGroup(c) && hasChildren(c)) {
      prefixChildrenPaths(c, parentPath);
    }
  });
}

export function makeGroup(
  name: string,
  children: Entity[] = [],
  opts: Omit<GroupOpts, 'children'> = {}
): GroupWithChildren {
  const { attributes = [], link, isRoot = false } = opts;
  const path = isRoot ? '/' : `/${name}`;

  const group: GroupWithChildren = {
    name,
    path,
    kind: EntityKind.Group,
    children,
    attributes,
    link,
  };

  prefixChildrenPaths(group, path);
  return group;
}

export function makeDataset<S extends Shape, T extends DType>(
  name: string,
  type: T,
  shape: S,
  opts: DatasetOpts = {}
): MockDataset<S, T> {
  const { attributes = [], valueId = name, link } = opts;

  return {
    name,
    path: `/${name}`,
    kind: EntityKind.Dataset,
    attributes,
    shape,
    type,
    value: mockValues[valueId as MockValueId],
    link,
  };
}

export function makeScalarDataset<T extends DType>(
  name: string,
  type: T,
  opts: DatasetOpts = {}
): MockDataset<ScalarShape, T> {
  return makeDataset(name, type, [], opts);
}

export function makeDatatype<T extends DType>(
  name: string,
  type: T,
  opts: EntityOpts = {}
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

export function makeUnresolvedEntity(
  name: string,
  linkClass: LinkClass,
  pathToEntity?: string,
  file?: string
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

export function makeNxAxesAttr(
  axes: string[]
): Attribute<ArrayShape, StringType> {
  return makeAttr('axes', stringType, [axes.length], axes);
}

export function makeNxAuxAttr(
  aux: string[]
): Attribute<ArrayShape, StringType> {
  return makeAttr('auxiliary_signals', stringType, [aux.length], aux);
}

export function makeSilxStyleAttr(
  style: SilxStyle
): Attribute<ScalarShape, StringType> {
  const { signalScaleType, axisScaleTypes } = style;

  return makeStrAttr(
    'SILX_style',
    JSON.stringify({
      signal_scale_type: signalScaleType,
      axes_scale_type: axisScaleTypes,
    })
  );
}

export function makeNxGroup(
  name: string,
  type: 'NXroot' | 'NXentry' | 'NXprocess' | 'NXdata',
  opts: { defaultPath?: string } & GroupOpts = {}
): Group {
  const { defaultPath, children, ...groupOpts } = opts;

  return makeGroup(name, children, {
    ...groupOpts,
    attributes: [
      ...(groupOpts.attributes || []),
      makeStrAttr('NX_class', type),
      ...(defaultPath ? [makeStrAttr('default', defaultPath)] : []),
    ],
  });
}

export function makeNxDataGroup<
  T extends Record<string, MockDataset<ArrayShape, NumericType>>
>(
  name: string,
  opts: {
    signal: MockDataset<ArrayShape, NumericType | ComplexType>;
    errors?: MockDataset<ArrayShape, NumericType>;
    title?: MockDataset<ScalarShape, StringType>;
    silxStyle?: SilxStyle;
  } & (
    | { axes: T; axesAttr: (Extract<keyof T, string> | '.')[] }
    | { axes?: never; axesAttr?: never }
  ) &
    (
      | { auxiliary: T; auxAttr: Extract<keyof T, string>[] }
      | { auxiliary?: never; auxAttr?: never }
    ) &
    GroupOpts
): Group {
  const {
    signal,
    title,
    errors,
    silxStyle,
    axes = {},
    axesAttr,
    auxiliary = {},
    auxAttr,
    ...groupOpts
  } = opts;

  return makeNxGroup(name, 'NXdata', {
    ...groupOpts,
    attributes: [
      ...(groupOpts.attributes || []),
      makeStrAttr('signal', signal.name),
      ...(axesAttr ? [makeNxAxesAttr(axesAttr)] : []),
      ...(silxStyle ? [makeSilxStyleAttr(silxStyle)] : []),
      ...(auxAttr ? [makeNxAuxAttr(auxAttr)] : []),
    ],
    children: [
      signal,
      ...(title ? [title] : []),
      ...(errors ? [errors] : []),
      ...Object.values<MockDataset>(axes),
      ...Object.values<MockDataset>(auxiliary),
    ],
  });
}

export function makeNxDataset<T extends NumericType | ComplexType>(
  name: string,
  type: T,
  dims: number[],
  opts: {
    interpretation?: string;
    longName?: string;
    units?: string;
  } & DatasetOpts = {}
): MockDataset<ArrayShape, T> {
  const { interpretation, longName, units, ...datasetOpts } = opts;

  return makeDataset(name, type, dims, {
    ...datasetOpts,
    attributes: [
      ...(datasetOpts.attributes || []),
      ...(interpretation
        ? [makeStrAttr('interpretation', interpretation)]
        : []),
      ...(longName ? [makeStrAttr('long_name', longName)] : []),
      ...(units ? [makeStrAttr('units', units)] : []),
    ],
  });
}

export function withNxInterpretation<
  T extends MockDataset<ArrayShape, NumericType | ComplexType>
>(dataset: T, interpretation: NxInterpretation): T {
  return withAttributes(dataset, [
    makeStrAttr('interpretation', interpretation),
  ]);
}
