import {
  HDF5Attribute,
  HDF5Id,
  HDF5Link,
  HDF5Shape,
  HDF5Type,
} from './hdf5-models';

export enum EntityKind {
  Group = 'group',
  Dataset = 'dataset',
  Datatype = 'datatype',
  Link = 'link',
}

export interface Entity {
  uid: string;
  name: string;
  kind: EntityKind;
  parent?: Group;
  attributes: HDF5Attribute[];
  rawLink?: HDF5Link;
}

export interface ResolvedEntity extends Entity {
  id: HDF5Id;
}

export interface Group extends ResolvedEntity {
  kind: EntityKind.Group;
  children: Entity[];
}

export interface Dataset<
  S extends HDF5Shape = HDF5Shape,
  T extends HDF5Type = HDF5Type
> extends ResolvedEntity {
  kind: EntityKind.Dataset;
  shape: S;
  type: T;
}

export interface Datatype<T = HDF5Type> extends ResolvedEntity {
  kind: EntityKind.Datatype;
  type: T;
}

export interface Link<T extends HDF5Link = HDF5Link> extends Entity {
  kind: EntityKind.Link;
  rawLink: T;
}

export type Metadata = Group;
