import { mockValues, mockMetadata } from './data';
import {
  assertDefined,
  assertArray,
  assertDataset,
  assertSimpleShape,
  assertNumericType,
} from '../../guards';
import ndarray from 'ndarray';
import { getEntityAtPath } from '../../utils';
import { nanoid } from 'nanoid';
import {
  HDF5Attribute,
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
  MyHDF5Dataset,
  MyHDF5Datatype,
  MyHDF5Entity,
  MyHDF5EntityKind,
  MyHDF5Group,
  MyHDF5Link,
  MyHDF5ResolvedEntity,
} from '../models';
import { NxInterpretation, SilxStyle } from '../../visualizations/nexus/models';

/* -------------------------- */
/* ----- TYPES & SHAPES ----- */

export const intType: HDF5IntegerType = {
  class: HDF5TypeClass.Integer,
  base: 'H5T_STD_I32LE',
};

export const floatType: HDF5FloatType = {
  class: HDF5TypeClass.Float,
  base: 'H5T_IEEE_F64LE',
};

export const stringType: HDF5StringType = {
  class: HDF5TypeClass.String,
  charSet: 'H5T_CSET_ASCII',
  strPad: 'H5T_STR_NULLPAD',
  length: 'H5T_VARIABLE',
};

export const compoundType: HDF5CompoundType = {
  class: HDF5TypeClass.Compound,
  fields: [{ name: 'int', type: intType }],
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

export function withMyAttributes<T extends MyHDF5Entity>(
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

type EntityOpts = Partial<
  Pick<MyHDF5ResolvedEntity, 'id' | 'attributes' | 'rawLink'>
>;

type GroupOpts = EntityOpts & { children?: MyHDF5Entity[] };

export function makeMyGroup(
  name: string,
  children: MyHDF5Entity[] = [],
  opts: Omit<GroupOpts, 'children'> = {}
): MyHDF5Group {
  const { id = name, attributes = [], rawLink } = opts;

  const group: MyHDF5Group = {
    uid: nanoid(),
    id,
    name,
    kind: MyHDF5EntityKind.Group,
    children,
    attributes,
    rawLink,
  };

  group.children.forEach((child) => {
    child.parent = group;
  });

  return group;
}

export function makeMyDataset<S extends HDF5Shape, T extends HDF5Type>(
  name: string,
  shape: S,
  type: T,
  opts: EntityOpts = {}
): MyHDF5Dataset<S, T> {
  const { id = name, attributes = [], rawLink } = opts;

  return {
    uid: nanoid(),
    id,
    name,
    kind: MyHDF5EntityKind.Dataset,
    attributes,
    shape,
    type,
    rawLink,
  };
}

export function makeMySimpleDataset<T extends HDF5Type>(
  name: string,
  type: T,
  dims: HDF5Dims,
  opts: EntityOpts = {}
): MyHDF5Dataset<HDF5SimpleShape, T> {
  return makeMyDataset(name, makeSimpleShape(dims), type, opts);
}

export function makeMyDatatype<T extends HDF5Type>(
  name: string,
  type: T,
  opts: EntityOpts = {}
): MyHDF5Datatype<T> {
  const { id = name, attributes = [], rawLink } = opts;

  return {
    uid: nanoid(),
    id,
    name,
    kind: MyHDF5EntityKind.Datatype,
    attributes,
    type,
    rawLink,
  };
}

function makeMyLink<T extends HDF5Link>(rawLink: T): MyHDF5Link<T> {
  return {
    uid: nanoid(),
    name: rawLink.title,
    kind: MyHDF5EntityKind.Link,
    attributes: [],
    rawLink,
  };
}

export function makeMyExternalLink(
  name: string,
  file: string,
  h5path: string
): MyHDF5Link<HDF5ExternalLink> {
  return makeMyLink({
    class: HDF5LinkClass.External,
    title: name,
    file,
    h5path,
  });
}

/* ----------------- */
/* ----- NEXUS ----- */

function makeSilxStyleAttr(style: SilxStyle): HDF5Attribute {
  const { signalScaleType, axesScaleType } = style;

  return makeStrAttr(
    'SILX_style',
    JSON.stringify({
      signal_scale_type: signalScaleType,
      axes_scale_type: axesScaleType,
    })
  );
}

function makeNxAxesAttr(axes: string[]): HDF5Attribute {
  return makeAttr('axes', makeSimpleShape([axes.length]), stringType, axes);
}

export function makeMyNxDataGroup<
  T extends Record<string, MyHDF5Dataset<HDF5SimpleShape, HDF5NumericType>>
>(
  name: string,
  opts: {
    signal: MyHDF5Dataset<HDF5SimpleShape, HDF5NumericType>;
    errors?: MyHDF5Dataset<HDF5SimpleShape, HDF5NumericType>;
    title?: MyHDF5Dataset<HDF5ScalarShape, HDF5StringType>;
    silxStyle?: SilxStyle;
  } & (
    | { axes: T; axesAttr: (Extract<keyof T, string> | '.')[] }
    | { axes?: never; axesAttr?: never }
  ) &
    GroupOpts
): MyHDF5Group {
  const {
    signal,
    title,
    errors,
    silxStyle,
    axes = {},
    axesAttr,
    ...groupOpts
  } = opts;

  return makeMyGroup(
    name,
    [
      signal,
      ...(title ? [title] : []),
      ...(errors ? [errors] : []),
      ...Object.values<MyHDF5Dataset>(axes),
    ],
    {
      ...groupOpts,
      attributes: [
        ...(groupOpts.attributes || []),
        makeStrAttr('NX_class', 'NXdata'),
        makeStrAttr('signal', signal.name),
        ...(axesAttr ? [makeNxAxesAttr(axesAttr)] : []),
        ...(silxStyle ? [makeSilxStyleAttr(silxStyle)] : []),
      ],
    }
  );
}

export function makeMyNxEntityGroup(
  name: string,
  type: 'NXroot' | 'NXentry' | 'NXprocess',
  opts: { defaultPath?: string } & GroupOpts = {}
): MyHDF5Group {
  const { defaultPath, children, ...groupOpts } = opts;

  return makeMyGroup(name, children, {
    ...groupOpts,
    attributes: [
      ...(groupOpts.attributes || []),
      makeStrAttr('NX_class', type),
      ...(defaultPath ? [makeStrAttr('default', defaultPath)] : []),
    ],
  });
}

export function makeMyNxDataset(
  name: string,
  type: HDF5NumericType,
  dims: HDF5Dims,
  opts: {
    interpretation?: string;
    longName?: string;
    units?: string;
  } & EntityOpts = {}
): MyHDF5Dataset<HDF5SimpleShape, HDF5NumericType> {
  const { interpretation, longName, units } = opts;

  return makeMySimpleDataset(name, type, dims, {
    ...opts,
    attributes: [
      ...(opts.attributes || []),
      ...(interpretation
        ? [makeStrAttr('interpretation', interpretation)]
        : []),
      ...(longName ? [makeStrAttr('long_name', longName)] : []),
      ...(units ? [makeStrAttr('units', units)] : []),
    ],
  });
}

export function withMyInterpretation<
  T extends MyHDF5Dataset<HDF5SimpleShape, HDF5NumericType>
>(dataset: T, interpretation: NxInterpretation): T {
  return withMyAttributes(dataset, [
    makeStrAttr('interpretation', interpretation),
  ]);
}

/* ------------------ */
/* ----- VALUES ----- */

export function getMockDataArray(path: string): ndarray {
  const dataset = getEntityAtPath(mockMetadata, path);
  assertDefined(dataset, `Expected entity at path "${path}"`);
  assertDataset(dataset, `Expected group at path "${path}"`);
  assertNumericType(dataset);
  assertSimpleShape(dataset);

  const value = mockValues[dataset.id as keyof typeof mockValues];
  assertArray<number>(value);

  return ndarray(value, dataset.shape.dims);
}
