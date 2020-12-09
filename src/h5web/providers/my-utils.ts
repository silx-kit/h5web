import { nanoid } from 'nanoid';
import {
  HDF5Attribute,
  HDF5Dims,
  HDF5NumericType,
  HDF5Shape,
  HDF5SimpleShape,
  HDF5Type,
  MyHDF5Dataset,
  MyHDF5Datatype,
  MyHDF5Entity,
  MyHDF5EntityKind,
  MyHDF5Group,
} from '../providers/models';
import { makeSimpleShape, makeStrAttr } from '../providers/mock/data';
import { NxInterpretation } from '../visualizations/nexus/models';

type Opts = Partial<Pick<MyHDF5Dataset, 'id' | 'attributes'>>;

export function makeMyGroup(
  name: string,
  children: MyHDF5Entity[] = [],
  opts: Opts = {}
): MyHDF5Group {
  const { id = name, attributes = [] } = opts;

  const group: MyHDF5Group = {
    uid: nanoid(),
    id,
    name,
    kind: MyHDF5EntityKind.Group,
    children,
    attributes,
  };

  group.children = group.children.map((child) => ({
    ...child,
    parent: group,
  }));

  return group;
}

export function makeMyDataset<S extends HDF5Shape, T extends HDF5Type>(
  name: string,
  shape: S,
  type: T,
  opts: Opts = {}
): MyHDF5Dataset<S, T> {
  const { id = name, attributes = [] } = opts;

  return {
    uid: nanoid(),
    id,
    name,
    kind: MyHDF5EntityKind.Dataset,
    attributes,
    shape,
    type,
  };
}

export function makeMySimpleDataset<T extends HDF5Type>(
  name: string,
  type: T,
  dims: HDF5Dims,
  opts: Opts = {}
): MyHDF5Dataset<HDF5SimpleShape, T> {
  return makeMyDataset(name, makeSimpleShape(dims), type, opts);
}

export function makeMyDatatype<T extends HDF5Type>(
  name: string,
  type: T,
  opts: Opts = {}
): MyHDF5Datatype<T> {
  const { id = name, attributes = [] } = opts;

  return {
    uid: nanoid(),
    id,
    name,
    kind: MyHDF5EntityKind.Datatype,
    attributes,
    type,
  };
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

export function makeMyNxDataGroup(
  name: string,
  signal: MyHDF5Dataset,
  opts: Opts = {}
): MyHDF5Group {
  return makeMyGroup(name, [signal], {
    ...opts,
    attributes: [
      ...(opts.attributes || []),
      makeStrAttr('NX_class', 'NXdata'),
      makeStrAttr('signal', signal.name),
    ],
  });
}

export function makeMyNxDataGroupWithAxes(
  name: string,
  opts: {
    signal: MyHDF5Dataset<HDF5SimpleShape, HDF5NumericType>;
    axes: Record<string, MyHDF5Dataset<HDF5SimpleShape, HDF5NumericType>>;
    axesAttr: (keyof typeof opts.axes | '.')[];
  } & Opts
): MyHDF5Group {
  const { signal, axes, axesAttr, ...groupOpts } = opts;

  return makeMyGroup(name, [signal, ...Object.values(axes)], {
    ...groupOpts,
    attributes: [
      ...(groupOpts.attributes || []),
      makeStrAttr('NX_class', 'NXdata'),
      makeStrAttr('signal', signal.name),
      makeStrAttr('axes', axesAttr),
    ],
  });
}

export function makeMyNxEntityGroup(
  name: string,
  type: 'NXroot' | 'NXentry' | 'NXprocess',
  opts: { defaultPath?: string; children?: MyHDF5Entity[] } & Opts = {}
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
