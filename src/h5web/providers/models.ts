import type {
  HDF5Attribute,
  HDF5Link,
  HDF5NumericType,
  HDF5Shape,
  HDF5SimpleShape,
  HDF5StringType,
  HDF5Type,
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

export interface Dataset<
  S extends HDF5Shape = HDF5Shape,
  T extends HDF5Type = HDF5Type
> extends Entity {
  kind: EntityKind.Dataset;
  shape: S;
  type: T;
}

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
  : unknown;

export type Value<
  S extends HDF5Shape,
  T extends HDF5Type
> = S extends HDF5SimpleShape ? PrimitiveType<T>[] : PrimitiveType<T>;
