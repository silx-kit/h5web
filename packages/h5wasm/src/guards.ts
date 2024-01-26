import { isCompoundType } from '@h5web/shared/guards';
import type { Dataset, DType } from '@h5web/shared/hdf5-models';
import { DTypeClass } from '@h5web/shared/hdf5-models';
import type { Metadata } from 'h5wasm';
import { Dataset as H5WasmDataset } from 'h5wasm';

import type {
  CompoundMetadata,
  EnumMetadata,
  H5WasmEntity,
  NumericMetadata,
} from './models';

export function assertH5WasmDataset(
  entity: H5WasmEntity,
): asserts entity is H5WasmDataset {
  if (!(entity instanceof H5WasmDataset)) {
    throw new TypeError('Expected H5Wasm entity to be dataset');
  }
}

// See H5T_class_t in https://github.com/usnistgov/h5wasm/blob/main/src/hdf5_util_helpers.d.ts
export function isIntegerMetadata(metadata: Metadata) {
  return metadata.type === 0;
}

export function isFloatMetadata(metadata: Metadata) {
  return metadata.type === 1;
}

export function isNumericMetadata(
  metadata: Metadata,
): metadata is NumericMetadata {
  return isIntegerMetadata(metadata) || isFloatMetadata(metadata);
}

export function isStringMetadata(metadata: Metadata) {
  return metadata.type === 3;
}

export function isArrayMetadata(metadata: Metadata) {
  return metadata.type === 10;
}

export function isCompoundMetadata(
  metadata: Metadata,
): metadata is CompoundMetadata {
  return metadata.type === 6;
}

export function isEnumMetadata(metadata: Metadata): metadata is EnumMetadata {
  return metadata.type === 8;
}

export function assertCompoundMetadata(
  metadata: Metadata,
): asserts metadata is CompoundMetadata {
  if (!isCompoundMetadata(metadata)) {
    throw new Error('Expected H5Wasm compound metadata');
  }
}

export function assertNumericMetadata(
  metadata: Metadata,
): asserts metadata is NumericMetadata {
  if (!isNumericMetadata(metadata)) {
    throw new Error('Expected H5Wasm numeric metadata');
  }
}

function isInt64Type(type: DType): boolean {
  return (
    (type.class === DTypeClass.Integer || type.class === DTypeClass.Unsigned) &&
    type.size === 64
  );
}

export function hasInt64Type(dataset: Dataset) {
  const { type } = dataset;
  return (
    isInt64Type(type) ||
    (isCompoundType(type) && Object.values(type.fields).some(isInt64Type))
  );
}
