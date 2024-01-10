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
  path?: string;
  file?: string;
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
  Unknown = 'Unknown',
}

export enum Endianness {
  LE = 'little-endian',
  BE = 'big-endian',
}

export type DType =
  | PrintableType
  | CompoundType
  | ArrayType
  | EnumType
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
  charSet: 'UTF-8' | 'ASCII';
  length?: number;
}

export interface CompoundType<T extends DType = DType> {
  class: DTypeClass.Compound;
  fields: Record<string, T>;
}

export type PrintableCompoundType = CompoundType<PrintableType>;

interface ArrayType {
  class: DTypeClass.Array | DTypeClass.VLen;
  base: DType;
  dims?: number[];
}

interface EnumType {
  class: DTypeClass.Enum;
  base: DType;
  mapping: Record<string, number>;
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

export type Value<D extends Dataset> = D extends Dataset<infer S, infer T>
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
