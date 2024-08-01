/* -------------------- */
/* ----- ENTITIES ----- */

import type { TypedArray } from 'ndarray';

import type {
  H5T_CSET,
  H5T_ORDER,
  H5T_STR,
  H5T_TO_CHAR_SET,
  H5T_TO_ENDIANNESS,
  H5T_TO_STR_PAD,
} from './h5t';

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
  virtualSources?: VirtualSource[];
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

export interface Filter {
  id: number;
  name: string;
}

export interface VirtualSource {
  file: string;
  path: string;
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

export type Endianness = (typeof H5T_TO_ENDIANNESS)[H5T_ORDER];
export type CharSet = (typeof H5T_TO_CHAR_SET)[H5T_CSET];
export type StrPad = (typeof H5T_TO_STR_PAD)[H5T_STR];

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
  endianness: Endianness | undefined;
}

export type NumericLikeType = NumericType | BooleanType | EnumType;

export interface ComplexType {
  class: DTypeClass.Complex;
  realType: NumericType;
  imagType: NumericType;
}

export interface StringType {
  class: DTypeClass.String;
  charSet: CharSet | undefined;
  strPad: StrPad | undefined;
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
  endianness: Endianness | undefined;
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

export type H5WebComplex = [real: number, imag: number];
export type ComplexArray = (ComplexArray | H5WebComplex)[];
