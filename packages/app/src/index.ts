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
export {
  useEntity,
  useDatasetValue,
  useDatasetsValues,
  usePrefetchValues,
} from './hooks';
export { useBaseArray as useNdArray } from './vis-packs/core/hooks';

// Models
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
  hasIntegerType,
  hasFloatType,
  hasNumericType,
  hasBoolType,
  hasEnumType,
  hasNumericLikeType,
  hasComplexType,
  hasPrintableType,
  hasCompoundType,
  assertStringType,
  assertIntegerType,
  assertFloatType,
  assertNumericType,
  assertBoolType,
  assertEnumType,
  assertNumericLikeType,
  assertComplexType,
  assertPrintableType,
  assertCompoundType,
  assertScalarValue,
  assertDatasetValue,
} from '@h5web/shared/guards';

// Undocumented
export { default as DataProvider } from './providers/DataProvider';
export { DataProviderApi } from './providers/api';
export { getValueOrError } from './providers/utils';
export { useValuesInCache } from './hooks';
export { applyMapping, getBaseArray, toNumArray } from './vis-packs/core/utils';
export {
  useBaseArray,
  useMappedArray,
  useMappedArrays,
  useToNumArray,
  useToNumArrays,
} from './vis-packs/core/hooks';
