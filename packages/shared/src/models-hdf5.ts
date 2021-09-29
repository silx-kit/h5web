/* -------------------- */
/* ----- ENTITIES ----- */

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

export interface Group extends Entity {
  kind: EntityKind.Group;
}

export interface GroupWithChildren extends Group {
  children: Entity[];
}

export interface Dataset<S extends Shape = Shape, T extends DType = DType>
  extends Entity {
  kind: EntityKind.Dataset;
  shape: S;
  type: T;
  rawType?: unknown;
}

export interface MockDataset<S extends Shape = Shape, T extends DType = DType>
  extends Dataset<S, T> {
  value: unknown;
}

export interface Datatype<T = DType> extends Entity {
  kind: EntityKind.Datatype;
  type: T;
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
  value: unknown;
}

export type NumArrayDataset = Dataset<ArrayShape, NumericType>;

/* ----------------- */
/* ----- SHAPE ----- */

export type Shape = ArrayShape | ScalarShape | null;
export type ArrayShape = number[];
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
  dims?: number[];
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

export type Primitive<T extends DType> = T extends NumericType
  ? number
  : T extends StringType
  ? string
  : T extends BooleanType
  ? boolean
  : T extends ComplexType
  ? H5WebComplex
  : unknown;

export type Value<D extends Dataset> = D['shape'] extends ScalarShape
  ? Primitive<D['type']>
  : D['shape'] extends ArrayShape
  ? Primitive<D['type']>[]
  : never;

export type H5WebComplex = [number, number];
export type ComplexArray = (ComplexArray | H5WebComplex)[];
