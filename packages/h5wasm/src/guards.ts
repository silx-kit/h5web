import { isCompoundType } from '@h5web/shared/guards';
import type { Dataset, DType } from '@h5web/shared/hdf5-models';
import { DTypeClass } from '@h5web/shared/hdf5-models';
import { Dataset as H5WasmDataset } from 'h5wasm';

import type { H5WasmEntity } from './models';

export function assertH5WasmDataset(
  h5wEntity: NonNullable<H5WasmEntity>,
): asserts h5wEntity is H5WasmDataset {
  if (!(h5wEntity instanceof H5WasmDataset)) {
    throw new TypeError('Expected H5Wasm entity to be dataset');
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
