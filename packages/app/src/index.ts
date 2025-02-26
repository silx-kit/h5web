import { type DataProviderApi } from './providers/api';

export { default as App } from './App';

export { default as MockProvider } from './providers/mock/MockProvider';
export { default as HsdsProvider } from './providers/hsds/HsdsProvider';
export { default as H5GroveProvider } from './providers/h5grove/H5GroveProvider';

export { enableBigIntSerialization } from './utils';
export { getFeedbackMailto } from './breadcrumbs/utils';
export type { FeedbackContext } from './breadcrumbs/models';
export type GetExportURL = NonNullable<DataProviderApi['getExportURL']>;
export type {
  ExportFormat,
  ExportURL,
  BuiltInExporter,
} from '@h5web/shared/vis-models';

// Context
export { useDataContext } from './providers/DataProvider';
export type { DataContextValue } from './providers/DataProvider';

// Undocumented (for @h5web/h5wasm)
export { default as DataProvider } from './providers/DataProvider';
export { DataProviderApi } from './providers/api';
export type { ValuesStoreParams } from './providers/models';
export { getValueOrError } from './providers/utils';

// Undocumented models
export { EntityKind } from '@h5web/shared/hdf5-models';

export type {
  // Entity
  Entity,
  ProvidedEntity,
  ChildEntity,
  Group,
  GroupWithChildren,
  Dataset,
  Datatype,
  UnresolvedEntity,
  LinkClass,
  Attribute,
  Filter,
  VirtualSource,

  // Shape
  Shape,
  ScalarShape,
  ArrayShape,

  // Type
  DType,
  StringType,
  IntegerType,
  FloatType,
  NumericType,
  BooleanType,
  EnumType,
  NumericLikeType,
  ComplexType,
  PrintableType,
  CompoundType,
  ArrayType,
  VLenType,
  TimeType,
  BitfieldType,
  OpaqueType,
  ReferenceType,
  UnknownType,

  // Value
  ScalarValue,
  ArrayValue,
  AttributeValues,
  H5WebComplex,
} from '@h5web/shared/hdf5-models';

// Undocumented guards and assertions
export {
  isDefined,
  isNonNull,
  assertDefined,
  assertNonNull,
  assertNum,
  assertStr,
  assertEnvVar,
  assertComplex,
  isTypedArray,
  isBigIntTypedArray,
  assertArray,
  assertArrayOrTypedArray,
  isGroup,
  hasChildren,
  isDataset,
  isDatatype,
  assertGroup,
  assertGroupWithChildren,
  assertDataset,
  assertDatatype,
  isScalarShape,
  isArrayShape,
  hasScalarShape,
  hasArrayShape,
  hasNonNullShape,
  assertScalarShape,
  assertArrayShape,
  assertNonNullShape,
  hasMinDims,
  hasNumDims,
  assertMinDims,
  assertNumDims,
  isStringType,
  isIntegerType,
  isFloatType,
  isNumericType,
  isBoolType,
  isEnumType,
  isNumericLikeType,
  isComplexType,
  isPrintableType,
  isCompoundType,
  hasStringType,
  hasNumericType,
  hasBoolType,
  hasEnumType,
  hasNumericLikeType,
  hasComplexType,
  hasPrintableType,
  hasCompoundType,
  assertStringType,
  assertNumericType,
  assertNumericLikeType,
  assertComplexType,
  assertPrintableType,
  assertCompoundType,
  assertScalarValue,
  assertDatasetValue,
} from '@h5web/shared/guards';
