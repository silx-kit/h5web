import type Complex from 'complex.js';
import type { HDF5Link, HDF5Dims, HDF5Value } from './hdf5-models';

/* -------------------- */
/* ----- ENTITIES ----- */

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

export interface Dataset<S extends Shape = Shape, T extends DType = DType>
  extends Entity {
  kind: EntityKind.Dataset;
  shape: S;
  type: T;
  rawType?: unknown;
}

export type NumArrayDataset = Dataset<ArrayShape, NumericType>;

export interface Datatype<T = DType> extends Entity {
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
  type: DType;
  value: HDF5Value;
}

/* ----------------- */
/* ----- SHAPE ----- */

export type Shape = ArrayShape | ScalarShape | null;
export type ArrayShape = HDF5Dims;
export type ScalarShape = never[];

/* ---------------- */
/* ----- TYPE ----- */

export enum DTypeClass {
  Bool = 'Boolean',
  Integer = 'Integer',
  Unsigned = 'Integer (unsigned)',
  Float = 'Float',
  Complex = 'Complex',
  String = 'String',
  Compound = 'Compound',
  Array = 'Array',
  VLen = 'Array (variable length)',
  Enum = 'Enumeration',
  Unknown = 'Unknown',
}

export type DType =
  | NumericType
  | StringType
  | BooleanType
  | ComplexType
  | ArrayType
  | CompoundType
  | EnumType
  | UnknownType;

export enum Endianness {
  LE = 'little-endian',
  BE = 'big-endian',
}

export interface BooleanType {
  class: DTypeClass.Bool;
}

export interface NumericType {
  class: DTypeClass.Integer | DTypeClass.Float | DTypeClass.Unsigned;
  size: number;
  endianness?: Endianness;
}

export interface ComplexType {
  class: DTypeClass.Complex;
  realType: DType;
  imagType: DType;
}

export interface StringType {
  class: DTypeClass.String;
  charSet: 'UTF-8' | 'ASCII';
  length?: number;
}

export interface CompoundType {
  class: DTypeClass.Compound;
  fields: Record<string, DType>;
}

interface ArrayType {
  class: DTypeClass.Array | DTypeClass.VLen;
  base: DType;
  dims?: HDF5Dims;
}

interface EnumType {
  class: DTypeClass.Enum;
  base: DType;
  mapping: Record<string, number>;
}

interface UnknownType {
  class: DTypeClass.Unknown;
}

/* ----------------- */
/* ----- VALUE ----- */

type PrimitiveType<T extends DType> = T extends NumericType
  ? number
  : T extends StringType
  ? string
  : T extends BooleanType
  ? boolean
  : T extends ComplexType
  ? Complex
  : unknown;

export type Value<D extends Dataset> = D['shape'] extends ScalarShape
  ? PrimitiveType<D['type']>
  : D['shape'] extends ArrayShape
  ? PrimitiveType<D['type']>[]
  : never;

export type ComplexArray = (ComplexArray | Complex)[];
