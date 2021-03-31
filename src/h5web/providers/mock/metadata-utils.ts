import {
  Datatype,
  Entity,
  EntityKind,
  Group,
  Link,
  ScalarShape,
  Shape,
  ArrayShape,
} from '../models';
import {
  HDF5Attribute,
  HDF5BooleanType,
  HDF5ComplexType,
  HDF5CompoundType,
  HDF5Dims,
  HDF5ExternalLink,
  HDF5FloatType,
  HDF5IntegerType,
  HDF5Link,
  HDF5LinkClass,
  HDF5NumericType,
  HDF5ScalarShape,
  HDF5Shape,
  HDF5ShapeClass,
  HDF5SimpleShape,
  HDF5StringType,
  HDF5Type,
  HDF5TypeClass,
  HDF5Value,
} from '../hdf5-models';
import type { NxInterpretation, SilxStyle } from '../../vis-packs/nexus/models';
import { isGroup } from '../../guards';
import { buildEntityPath } from '../../utils';
import type { MockDataset, MockValueId } from './models';
import { mockValues } from './values';

/* -------------------------- */
/* ----- TYPES & SHAPES ----- */

export const intType: HDF5IntegerType = {
  class: HDF5TypeClass.Integer,
  endianness: 'LE',
  size: 32,
};

export const floatType: HDF5FloatType = {
  class: HDF5TypeClass.Float,
  endianness: 'LE',
  size: 64,
};

export const stringType: HDF5StringType = {
  class: HDF5TypeClass.String,
  charSet: 'ASCII',
  length: 'H5T_VARIABLE',
};

export const compoundType: HDF5CompoundType = {
  class: HDF5TypeClass.Compound,
  fields: [{ name: 'int', type: intType }],
};

export const booleanType: HDF5BooleanType = {
  class: HDF5TypeClass.Bool,
};

export const complexType: HDF5ComplexType = {
  class: HDF5TypeClass.Complex,
  realType: floatType,
  imagType: floatType,
};

export const scalarShape: HDF5ScalarShape = { class: HDF5ShapeClass.Scalar };

export function makeSimpleShape(dims: HDF5Dims): HDF5SimpleShape {
  return { class: HDF5ShapeClass.Simple, dims };
}

/* ---------------------- */
/* ----- ATTRIBUTES ----- */

export function makeAttr(
  name: string,
  shape: HDF5Shape,
  type: HDF5Type,
  value: HDF5Value
): HDF5Attribute {
  return { name, type, shape, value };
}

export function makeStrAttr(name: string, value: string): HDF5Attribute {
  return makeAttr(name, { class: HDF5ShapeClass.Scalar }, stringType, value);
}

export function makeIntAttr(name: string, value: number): HDF5Attribute {
  return makeAttr(name, { class: HDF5ShapeClass.Scalar }, intType, value);
}

export function withAttributes<T extends Entity>(
  entity: T,
  attributes: HDF5Attribute[]
): T {
  return {
    ...entity,
    attributes: [...entity.attributes, ...attributes],
  };
}

/* -------------------- */
/* ----- ENTITIES ----- */

type EntityOpts = Partial<Pick<Entity, 'attributes' | 'rawLink'>>;
type GroupOpts = EntityOpts & { isRoot?: boolean; children?: Entity[] };
type DatasetOpts = EntityOpts & { valueId?: MockValueId };

function prefixChildrenPaths(group: Group, parentPath: string): void {
  group.children.forEach((c) => {
    c.path = buildEntityPath(parentPath, c.path.slice(1));

    if (isGroup(c)) {
      prefixChildrenPaths(c, parentPath);
    }
  });
}

export function makeGroup(
  name: string,
  children: Entity[] = [],
  opts: Omit<GroupOpts, 'children'> = {}
): Group {
  const { attributes = [], rawLink, isRoot = false } = opts;
  const path = isRoot ? '/' : `/${name}`;

  const group: Group = {
    name,
    path,
    kind: EntityKind.Group,
    children,
    attributes,
    rawLink,
  };

  prefixChildrenPaths(group, path);
  return group;
}

export function makeDataset<S extends Shape, T extends HDF5Type>(
  name: string,
  type: T,
  shape: S,
  opts: DatasetOpts = {}
): MockDataset<S, T> {
  const { attributes = [], valueId = name, rawLink } = opts;

  return {
    name,
    path: `/${name}`,
    kind: EntityKind.Dataset,
    attributes,
    shape,
    type,
    value: mockValues[valueId as MockValueId],
    rawLink,
  };
}

export function makeScalarDataset<T extends HDF5Type>(
  name: string,
  type: T,
  opts: DatasetOpts = {}
): MockDataset<ScalarShape, T> {
  return makeDataset(name, type, [], opts);
}

export function makeDatatype<T extends HDF5Type>(
  name: string,
  type: T,
  opts: EntityOpts = {}
): Datatype<T> {
  const { attributes = [], rawLink } = opts;

  return {
    name,
    path: `/${name}`,
    kind: EntityKind.Datatype,
    attributes,
    type,
    rawLink,
  };
}

function makeLink<T extends HDF5Link>(rawLink: T): Link<T> {
  return {
    name: rawLink.title,
    path: `/${rawLink.title}`,
    kind: EntityKind.Link,
    attributes: [],
    rawLink,
  };
}

export function makeExternalLink(
  name: string,
  file: string,
  h5path: string
): Link<HDF5ExternalLink> {
  return makeLink({
    class: HDF5LinkClass.External,
    title: name,
    file,
    h5path,
  });
}

/* ----------------- */
/* ----- NEXUS ----- */

function makeNxStrArrayAttr(
  array: string[],
  attrName: 'axes' | 'auxiliary_signals'
): HDF5Attribute {
  return makeAttr(attrName, makeSimpleShape([array.length]), stringType, array);
}

export function makeNxAxesAttr(axes: string[]): HDF5Attribute {
  return makeNxStrArrayAttr(axes, 'axes');
}

export function makeNxAuxAttr(aux: string[]): HDF5Attribute {
  return makeNxStrArrayAttr(aux, 'auxiliary_signals');
}

export function makeSilxStyleAttr(style: SilxStyle): HDF5Attribute {
  const { signalScaleType, axesScaleType } = style;

  return makeStrAttr(
    'SILX_style',
    JSON.stringify({
      signal_scale_type: signalScaleType,
      axes_scale_type: axesScaleType,
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
  T extends Record<string, MockDataset<ArrayShape, HDF5NumericType>>
>(
  name: string,
  opts: {
    signal: MockDataset<ArrayShape, HDF5NumericType>;
    errors?: MockDataset<ArrayShape, HDF5NumericType>;
    title?: MockDataset<ScalarShape, HDF5StringType>;
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

export function makeNxDataset(
  name: string,
  type: HDF5NumericType,
  dims: HDF5Dims,
  opts: {
    interpretation?: string;
    longName?: string;
    units?: string;
  } & DatasetOpts = {}
): MockDataset<ArrayShape, HDF5NumericType> {
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
  T extends MockDataset<ArrayShape, HDF5NumericType>
>(dataset: T, interpretation: NxInterpretation): T {
  return withAttributes(dataset, [
    makeStrAttr('interpretation', interpretation),
  ]);
}
