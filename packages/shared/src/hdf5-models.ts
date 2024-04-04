/* -------------------- */
/* ----- ENTITIES ----- */

import type { TypedArray } from 'ndarray';

export enum EntityKind {
  Group = 'group',
  Dataset = 'dataset',
  Datatype = 'datatype',
  Unresolved = 'unresolved',
}

export interface Entity {
  name: string;
  path: string;
  kind: EntityKind;
  attributes: Attribute[];
  link?: Link;
}

export type ProvidedEntity =
  | GroupWithChildren
  | Dataset
  | Datatype
  | UnresolvedEntity;

export type ChildEntity = Group | Dataset | Datatype | UnresolvedEntity;

export interface Group extends Entity {
  kind: EntityKind.Group;
}

export interface GroupWithChildren extends Group {
  children: ChildEntity[];
}

export interface Dataset<S extends Shape = Shape, T extends DType = DType>
  extends Entity {
  kind: EntityKind.Dataset;
  shape: S;
  type: T;
  rawType?: unknown;
  chunks?: number[];
  filters?: Filter[];
}

export interface Datatype<T = DType> extends Entity {
  kind: EntityKind.Datatype;
  type?: T;
  rawType?: unknown;
}

export interface UnresolvedEntity extends Entity {
  kind: EntityKind.Unresolved;
}

export type LinkClass = 'Hard' | 'Soft' | 'External';
interface Link {
  class: LinkClass;
  file?: string;
  path?: string;
}

export interface Attribute<S extends Shape = Shape, T extends DType = DType> {
  name: string;
  shape: S;
  type: T;
}

export type NumArrayDataset = Dataset<ArrayShape, NumericType>;

/* ----------------- */
/* ----- SHAPE ----- */

export type Shape = ArrayShape | ScalarShape | null;
export type ArrayShape = number[];
export type ScalarShape = [];

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
  Time = 'Time',
  Bitfield = 'Bitfield',
  Opaque = 'Opaque',
  Reference = 'Reference',
  Unknown = 'Unknown',
}

export enum Endianness {
  LE = 'little-endian',
  BE = 'big-endian',
}

export type CharSet = 'UTF-8' | 'ASCII';

export type DType =
  | PrintableType
  | CompoundType
  | ArrayType
  | EnumType
  | TimeType
  | BitfieldType
  | OpaqueType
  | ReferenceType
  | UnknownType;

export type PrintableType =
  | BooleanType
  | NumericType
  | ComplexType
  | StringType;

export interface BooleanType {
  class: DTypeClass.Bool;
}

export interface NumericType {
  class: DTypeClass.Integer | DTypeClass.Unsigned | DTypeClass.Float;
  size: number;
  endianness?: Endianness;
}

export type NumericLikeType = NumericType | BooleanType;

export interface ComplexType {
  class: DTypeClass.Complex;
  realType: NumericType;
  imagType: NumericType;
}

export interface StringType {
  class: DTypeClass.String;
  charSet: CharSet;
  length?: number;
}

export interface CompoundType<
  F extends Record<string, DType> = Record<string, DType>,
> {
  class: DTypeClass.Compound;
  fields: F;
}

export type PrintableCompoundType = CompoundType<Record<string, PrintableType>>;

export interface ArrayType<T extends DType = DType> {
  class: DTypeClass.Array | DTypeClass.VLen;
  base: T;
  dims?: number[];
}

export interface EnumType {
  class: DTypeClass.Enum;
  base: NumericType; // technically, only int/uint
  mapping: Record<string, number>;
}

export interface TimeType {
  class: DTypeClass.Time;
}

export interface BitfieldType {
  class: DTypeClass.Bitfield;
  endianness?: Endianness;
}

export interface ReferenceType {
  class: DTypeClass.Reference;
}

export interface OpaqueType {
  class: DTypeClass.Opaque;
  tag: string;
}

export interface UnknownType {
  class: DTypeClass.Unknown;
}

/* ----------------- */
/* ----- VALUE ----- */

export type Primitive<T extends DType> = T extends NumericType
  ? number
  : T extends StringType
    ? string
    : T extends BooleanType
      ? boolean
      : T extends ComplexType
        ? H5WebComplex
        : T extends PrintableCompoundType
          ? Primitive<PrintableType>[]
          : unknown;

export type ArrayValue<T extends DType> =
  | Primitive<T>[]
  | (T extends NumericType ? TypedArray : never);

export type Value<D extends Dataset> =
  D extends Dataset<infer S, infer T>
    ? S extends ScalarShape
      ? Primitive<T>
      : S extends ArrayShape
        ? ArrayValue<T>
        : never
    : never;

export type AttributeValues = Record<string, unknown>;

export type H5WebComplex = [number, number];
export type ComplexArray = (ComplexArray | H5WebComplex)[];

export interface Filter {
  id: number;
  name: string;
}

/* ------------------- */
/* ---- H5T ENUMS ---- */

// https://docs.hdfgroup.org/hdf5/develop/_h5_tpublic_8h.html#title3

export enum H5TClass {
  Integer = 0,
  Float = 1,
  Time = 2,
  String = 3,
  Bitfield = 4,
  Opaque = 5,
  Compound = 6,
  Reference = 7,
  Enum = 8,
  Vlen = 9,
  Array = 10,
}

export enum H5TOrder {
  LE = 0,
  BE = 1,
}

export enum H5TSign {
  Unsigned = 0,
  Signed = 1,
}

export enum H5TCharSet {
  ASCII = 0,
  UTF8 = 1,
}
