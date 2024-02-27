import { Dataset as H5WasmDataset } from 'h5wasm';

import type { H5WasmEntity } from './models';

export function assertH5WasmDataset(
  h5wEntity: NonNullable<H5WasmEntity>,
): asserts h5wEntity is H5WasmDataset {
  if (!(h5wEntity instanceof H5WasmDataset)) {
    throw new TypeError('Expected H5Wasm entity to be dataset');
  }
}
