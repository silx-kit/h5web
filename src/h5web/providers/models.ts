import type Complex from 'complex.js';
import type {
  HDF5BooleanType,
  HDF5ComplexType,
  HDF5Link,
  HDF5NumericType,
  HDF5StringType,
  HDF5Type,
  HDF5Dims,
  HDF5Value,
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
  attributes: Attribute[];
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
  rawType?: unknown;
}

export type NumArrayDataset = Dataset<ArrayShape, HDF5NumericType>;

export interface Datatype<T = HDF5Type> extends Entity {
  kind: EntityKind.Datatype;
  type: T;
  rawType?: unknown;
}

export interface Link<T extends HDF5Link = HDF5Link> extends Entity {
  kind: EntityKind.Link;
  rawLink: T;
}

export interface Attribute {
  name: string;
  shape: Shape;
  type: HDF5Type;
  value: HDF5Value;
}

export type Shape = ArrayShape | ScalarShape | null;
export type ArrayShape = HDF5Dims;
export type ScalarShape = never[];

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
