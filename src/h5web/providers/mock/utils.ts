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
  HDF5Dims,
  HDF5ExternalLink,
  HDF5Link,
  HDF5LinkClass,
  HDF5NumericType,
  HDF5ScalarShape,
  HDF5Shape,
  HDF5SimpleShape,
  HDF5StringType,
  HDF5Type,
  MyHDF5Dataset,
  MyHDF5Datatype,
  MyHDF5Entity,
  MyHDF5EntityKind,
  MyHDF5Group,
  MyHDF5Link,
  MyHDF5ResolvedEntity,
} from '../models';
import { NxInterpretation, SilxStyle } from '../../visualizations/nexus/models';
import {
  makeNxAxesAttr,
  makeSilxStyleAttr,
  makeSimpleShape,
  makeStrAttr,
} from '../raw-utils';

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

export function makeMyLink<T extends HDF5Link>(rawLink: T): MyHDF5Link<T> {
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

export function withMyAttributes<T extends MyHDF5Entity>(
  entity: T,
  attributes: HDF5Attribute[]
): T {
  return {
    ...entity,
    attributes: [...entity.attributes, ...attributes],
  };
}

export function withMyInterpretation<
  T extends MyHDF5Dataset<HDF5SimpleShape, HDF5NumericType>
>(dataset: T, interpretation: NxInterpretation): T {
  return withMyAttributes(dataset, [
    makeStrAttr('interpretation', interpretation),
  ]);
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

export function getMockDataArray(path: string): ndarray {
  const dataset = getEntityAtPath(mockMetadata, path);
  assertDefined(dataset, `Expected entity at path "${path}"`);
  assertDataset(dataset, `Expected group at path "${path}"`);
  assertNumericType(dataset);
  assertSimpleShape(dataset);

  const value = mockValues[dataset.id as keyof typeof mockValues];
  assertArray<number>(value);

  return ndarray(value.flat(Infinity), dataset.shape.dims);
}
