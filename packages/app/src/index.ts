import { type DataProviderApi } from './providers/api';

export { default as App } from './App';

export { default as MockProvider } from './providers/mock/MockProvider';
export { default as HsdsProvider } from './providers/hsds/HsdsProvider';
export { default as H5GroveProvider } from './providers/h5grove/H5GroveProvider';

export {
  createBasicFetcher,
  createAxiosFetcher,
  buildBasicAuthHeader,
} from './providers/utils';

export { enableBigIntSerialization } from './utils';
export { getFeedbackMailto } from './breadcrumbs/utils';
export { AbortError } from '@h5web/shared/react-suspense-fetch';

export type { FeedbackContext } from './breadcrumbs/models';
export type GetExportURL = NonNullable<DataProviderApi['getExportURL']>;
export type {
  NumArray,
  ExportFormat,
  ExportURL,
  BuiltInExporter,
} from '@h5web/shared/vis-models';

// Context
export { useDataContext } from './providers/DataProvider';
export type { DataContextValue } from './providers/DataProvider';
export type {
  EntitiesStore,
  ValuesStore,
  ValuesStoreParams,
  AttrValuesStore,
  Fetcher,
  FetcherOptions,
} from './providers/models';

// Hooks
export { useEntity, useDatasets, useValue, useValues } from './hooks';
export { useBaseArray as useNdArray } from './vis-packs/core/hooks';

// Models
export { EntityKind, ShapeClass, DTypeClass } from '@h5web/shared/hdf5-models';

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

  // Definition
  DatasetDef,

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
  Value,
  ScalarValue,
  ArrayValue,
  AttributeValues,
  H5WebComplex,
} from '@h5web/shared/hdf5-models';

// Type guards and assertions
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
  assertTypedArray,
  assertBigIntTypedArray,
  assertAnyTypedArray,
  assertArrayOrTypedArray,
  assertArrayOrAnyTypedArray,
  isGroup,
  hasChildren,
  isDataset,
  isDatatype,
  assertGroup,
  assertGroupWithChildren,
  assertDataset,
  assertDatatype,
  isShape,
  isScalarShape,
  isArrayShape,
  isNonNullShape,
  hasShape,
  hasScalarShape,
  hasArrayShape,
  hasNonNullShape,
  assertShape,
  assertScalarShape,
  assertArrayShape,
  assertNonNullShape,
  hasMinDims,
  hasNumDims,
  assertMinDims,
  assertNumDims,
  isType,
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
  hasType,
  hasStringType,
  hasIntegerType,
  hasFloatType,
  hasNumericType,
  hasBoolType,
  hasEnumType,
  hasNumericLikeType,
  hasComplexType,
  hasPrintableType,
  hasCompoundType,
  assertType,
  assertStringType,
  assertIntegerType,
  assertFloatType,
  assertNumericType,
  assertBoolType,
  assertEnumType,
  assertNumericLikeType,
  assertNumericLikeOrComplexType,
  assertComplexType,
  assertPrintableType,
  assertCompoundType,
  assertScalarValue,
  assertValue,
} from '@h5web/shared/guards';

// Undocumented
export { default as DataProvider } from './providers/DataProvider';
export { DataProviderApi } from './providers/api';
export { getValueOrError } from './providers/utils';
export { useValuesInCache } from './hooks';
export {
  hasAttribute,
  findAttribute,
  findScalarNumAttr,
  findScalarStrAttr,
  getAttributeValue,
} from './utils';
export { parseShape } from '@h5web/shared/hdf5-utils';

export { default as ValueFetcher } from './vis-packs/core/ValueFetcher';
export { applyMapping, getBaseArray, toNumArray } from './vis-packs/core/utils';
export {
  useBaseArray,
  useMappedArray,
  useMappedArrays,
  useToNumArray,
  useToNumArrays,
} from './vis-packs/core/hooks';
