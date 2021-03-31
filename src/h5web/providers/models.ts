import type Complex from 'complex.js';
import type {
  HDF5Attribute,
  HDF5BooleanType,
  HDF5ComplexType,
  HDF5Link,
  HDF5NumericType,
  HDF5StringType,
  HDF5Type,
  HDF5Dims,
} from './hdf5-models';

export enum EntityKind {
  Group = 'group',
  Dataset = 'dataset',
  Datatype = 'datatype',
  Link = 'link',
}

export interface Entity {
  name: string;
  path: string;
  kind: EntityKind;
  attributes: HDF5Attribute[];
  rawLink?: HDF5Link;
}

export interface Group extends Entity {
  kind: EntityKind.Group;
  children: Entity[];
}

export interface Dataset<S extends Shape = Shape, T extends HDF5Type = HDF5Type>
  extends Entity {
  kind: EntityKind.Dataset;
  shape: S;
  type: T;
}

export type Shape = ArrayShape | ScalarShape | NullShape;
export type ArrayShape = HDF5Dims;
export type ScalarShape = never[];
export type NullShape = null;

export interface Datatype<T = HDF5Type> extends Entity {
  kind: EntityKind.Datatype;
  type: T;
}

export interface Link<T extends HDF5Link = HDF5Link> extends Entity {
  kind: EntityKind.Link;
  rawLink: T;
}

type PrimitiveType<T extends HDF5Type> = T extends HDF5NumericType
  ? number
  : T extends HDF5StringType
  ? string
  : T extends HDF5BooleanType
  ? boolean
  : T extends HDF5ComplexType
  ? Complex
  : unknown;

export type Value<D extends Dataset> = D['shape'] extends ScalarShape
  ? PrimitiveType<D['type']>
  : D['shape'] extends ArrayShape
  ? PrimitiveType<D['type']>[]
  : never;

export type ComplexArray = (ComplexArray | Complex)[];

export type NumArrayDataset = Dataset<ArrayShape, HDF5NumericType>;
